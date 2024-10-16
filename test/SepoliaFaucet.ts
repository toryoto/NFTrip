const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SepoliaFaucet", function () {
  async function deployFaucetFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const SepoliaFaucet = await ethers.getContractFactory("SepoliaFaucet");
    const faucet = await SepoliaFaucet.deploy();

    // Fund the faucet
    await owner.sendTransaction({
      to: await faucet.getAddress(),
      value: ethers.parseEther("10.0"), // 10 ETH
    });

    return { faucet, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { faucet, owner } = await loadFixture(deployFaucetFixture);
      expect(await faucet.owner()).to.equal(owner.address);
    });

    it("Should have the correct initial withdrawal amount", async function () {
      const { faucet } = await loadFixture(deployFaucetFixture);
      expect(await faucet.withdrawalAmount()).to.equal(ethers.parseEther("0.05"));
    });

    it("Should have the correct initial lock time", async function () {
      const { faucet } = await loadFixture(deployFaucetFixture);
      expect(await faucet.lockTime()).to.equal(2n * 24n * 60n * 60n); // 2 days in seconds
    });
  });

  describe("Withdrawals", function () {
    it("Should allow withdrawal of tokens", async function () {
      const { faucet, addr1 } = await loadFixture(deployFaucetFixture);
      await expect(faucet.connect(addr1).requestTokens()).to.changeEtherBalances(
        [addr1, faucet],
        [ethers.parseEther("0.05"), ethers.parseEther("-0.05")]
      );
    });

    it("Should not allow withdrawal within lock time", async function () {
      const { faucet, addr1 } = await loadFixture(deployFaucetFixture);
      await faucet.connect(addr1).requestTokens();
      await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
        "Must wait 2 days between withdrawals"
      );
    });

    it("Should not allow withdrawal if faucet is empty", async function () {
      const { faucet, owner, addr1 } = await loadFixture(deployFaucetFixture);
      // Withdraw all funds from the faucet
      await faucet.connect(owner).withdraw();
      await expect(faucet.connect(addr1).requestTokens()).to.be.revertedWith(
        "Faucet is empty"
      );
    });
  });

  describe("Owner functions", function () {
    it("Should allow owner to change withdrawal amount", async function () {
      const { faucet, owner } = await loadFixture(deployFaucetFixture);
      await faucet.connect(owner).setWithdrawalAmount(ethers.parseEther("0.1"));
      expect(await faucet.withdrawalAmount()).to.equal(ethers.parseEther("0.1"));
    });

    it("Should allow owner to change lock time", async function () {
      const { faucet, owner } = await loadFixture(deployFaucetFixture);
      await faucet.connect(owner).setLockTime(3n * 24n * 60n * 60n); // 3 days
      expect(await faucet.lockTime()).to.equal(3n * 24n * 60n * 60n);
    });

    it("Should allow owner to withdraw all funds", async function () {
      const { faucet, owner } = await loadFixture(deployFaucetFixture);
      const faucetAddress = await faucet.getAddress();
      await expect(faucet.connect(owner).withdraw()).to.changeEtherBalances(
        [owner, faucetAddress],
        [ethers.parseEther("10.0"), ethers.parseEther("-10.0")]
      );
    });

    it("Should not allow non-owner to change withdrawal amount", async function () {
      const { faucet, addr1 } = await loadFixture(deployFaucetFixture);
      await expect(faucet.connect(addr1).setWithdrawalAmount(ethers.parseEther("0.1")))
        .to.be.revertedWith("Only the owner can call this function");
    });
  });
});