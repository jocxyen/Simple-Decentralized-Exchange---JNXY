const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wallet", function () {
  before(async function () {
    [owner] = await hre.ethers.getSigners();

    Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy();
    await wallet.deployed();

    Jnxy = await ethers.getContractFactory("JNXY");
    jnxy = await Jnxy.deploy();
    await jnxy.deployed();
  });

  it("Should only be possible for owner to add token", async function () {
    await wallet
      .connect(owner)
      .addToken(ethers.utils.formatBytes32String("JNXY"), jnxy.address);
  });

  it("Should handle deposit correctly", async function () {
    await jnxy.approve(wallet.address, 500);
    await wallet.deposit(200, ethers.utils.formatBytes32String("JNXY"));

    expect(
      await wallet.balances(
        owner.address,
        ethers.utils.formatBytes32String("JNXY")
      )
    ).to.equal(200);
  });
});
