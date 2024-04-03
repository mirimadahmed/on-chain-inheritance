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
});


