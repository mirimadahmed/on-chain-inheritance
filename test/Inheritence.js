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
});


