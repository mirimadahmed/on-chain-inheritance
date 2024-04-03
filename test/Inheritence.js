const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther, provider } = ethers;

describe("Inheritance Smart Contract", function () {
  async function deployInheritanceContract() {
    const Inheritance = await ethers.getContractFactory("Inheritance");
    const [owner, heir, newHeir, ...accounts] = await ethers.getSigners();

    // Deploy a new Inheritance contract before each test
    const inheritance = await Inheritance.deploy(heir.address);
    await inheritance.waitForDeployment();

    return { owner, heir, newHeir, accounts, inheritance };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { owner, inheritance } = await loadFixture(deployInheritanceContract);
      expect(await inheritance.owner()).to.equal(owner.address);
    });

    it("Should set the right heir", async function () {
      const { heir, inheritance } = await loadFixture(deployInheritanceContract);

      expect(await inheritance.heir()).to.equal(heir.address);
    });

    it("Should receive and store ETH correctly", async function () {
      const { owner, inheritance } = await loadFixture(deployInheritanceContract);
      await expect(() => owner.sendTransaction({ to: inheritance.target, value: 1 })).to.changeEtherBalance(owner, "-1");
      expect(await provider.getBalance(inheritance.target)).to.equal(1);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow the owner to withdraw", async function () {
      const { owner, inheritance } = await loadFixture(deployInheritanceContract);

      // Send 1 ether to the contract for testing withdrawal
      await owner.sendTransaction({ to: inheritance.target, value: parseEther("1.0") });

      // Attempt withdrawal
      await inheritance.withdraw(parseEther("1.0"));

      // Check if the contract balance has been updated
      expect(await provider.getBalance(inheritance.target)).to.equal(0);
    });

    it("Should reset the withdrawal timer when the owner withdraws", async function () {
      const { inheritance } = await loadFixture(deployInheritanceContract);

      // Assuming the initial `lastWithdrawal` state is set by the constructor
      const initialTimestamp = await inheritance.lastWithdrawal();

      // Move time forward by 15 days
      await time.increase(15 * 24 * 60 * 60);

      // Owner withdraws, which should reset the withdrawal timer
      await inheritance.withdraw(0);

      // The `lastWithdrawal` time should be greater than the initialTimestamp
      expect(await inheritance.lastWithdrawal()).to.be.gt(initialTimestamp);
    });

    it("Should emit a Withdrawal event when the owner withdraws", async function () {
      const { owner, inheritance } = await loadFixture(deployInheritanceContract);

      // Send some ether to the contract
      await owner.sendTransaction({ to: inheritance.target, value: parseEther("0.5") });

      // Expect the withdraw to emit an event
      await expect(inheritance.withdraw(parseEther("0.5")))
        .to.emit(inheritance, 'Withdrawal')
        .withArgs(owner.address, parseEther("0.5"));
    });
  });

  describe("Inheritance", function () {
    it("Should transfer ownership if the owner does not withdraw for more than 1 month", async function () {
      const { heir, newHeir, inheritance } = await loadFixture(deployInheritanceContract);

      // Move time forward to simulate 1 month of inactivity
      await time.increase(32 * 24 * 60 * 60);
      

      // Heir checks inheritance and should be able to claim ownership
      await inheritance.connect(heir).designateNewHeir(newHeir.address);
      expect(await inheritance.owner()).to.equal(heir.address);
      expect(await inheritance.heir()).to.equal(newHeir.address);
    });
  });

  describe("Heir Management", function () {
    beforeEach(async function () {
      const { owner, inheritance } = await loadFixture(deployInheritanceContract);

        // Send some ether to the contract to ensure it has a balance
        await owner.sendTransaction({ to: inheritance.target, value: parseEther("1.0") });
        
      });
      
      it("Should allow the heir to designate a new heir", async function () {
        const { heir, newHeir, inheritance } = await loadFixture(deployInheritanceContract);
        await time.increase(32 * 24 * 60 * 60);
        
        // Heir designates a new heir
        await inheritance.connect(heir).designateNewHeir(newHeir.address);
        // Check if the new heir is set correctly
        expect(await inheritance.heir()).to.equal(newHeir.address);
    });

    it("Should not allow non-heirs to designate a new heir", async function () {
      const { newHeir, inheritance } = await loadFixture(deployInheritanceContract);
      
        await time.increase(32 * 24 * 60 * 60);
        // Attempt to designate a new heir from an account that is not the current heir
        await expect(
            inheritance.connect(newHeir).designateNewHeir(newHeir.address)
        ).to.be.revertedWith("Only the heir can call this function.");
    });

    it("Should not allow setting the current owner or the current heir as the new heir", async function () {
      const { owner, heir, inheritance } = await loadFixture(deployInheritanceContract);

        await time.increase(32 * 24 * 60 * 60);
        // Attempt to set the current owner as the new heir
        await expect(
            inheritance.connect(heir).designateNewHeir(owner.address)
        ).to.be.revertedWith("New heir cannot be the current owner.");

        // Attempt to set the current heir as the new heir (to themselves)
        await expect(
            inheritance.connect(heir).designateNewHeir(heir.address)
        ).to.be.revertedWith("New heir cannot be the current heir.");
    });

    it("Should not allow setting the zero address as the new heir", async function () {
      const { heir, inheritance } = await loadFixture(deployInheritanceContract);

        await time.increase(32 * 24 * 60 * 60);
        // Attempt to set the zero address as the new heir
        await expect(
            inheritance.connect(heir).designateNewHeir(ethers.ZeroAddress)
        ).to.be.revertedWith("New heir cannot be the zero address.");
    });
  });
});


