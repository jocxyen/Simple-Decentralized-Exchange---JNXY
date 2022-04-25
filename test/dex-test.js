const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", function () {
  before(async function () {
    [owner, account1, account2, account3] = await hre.ethers.getSigners();

    DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy();
    await dex.deployed();

    Jnxy = await ethers.getContractFactory("JNXY");
    jnxy = await Jnxy.deploy();
    await jnxy.deployed();

    await dex
      .connect(owner)
      .addToken(ethers.utils.formatBytes32String("JNXY"), jnxy.address);

    await jnxy.approve(dex.address, 5000);
  });

  //User must have ETH deposited such that deposited eth >= BUY order value
  it("Should only be possible when deposited eth >= BUY order value", async function () {
    err = "";
    try {
      await dex.createLimitOrder(
        0,
        ethers.utils.formatBytes32String("JNXY"),
        50,

        10
      );
    } catch (e) {
      err = e.message;
    }
    expect(err).to.equal(
      "VM Exception while processing transaction: reverted with reason string 'Not enough balance!'"
    );

    await dex.depositEth({
      value: 100,
    });
    await dex.createLimitOrder(
      0,
      ethers.utils.formatBytes32String("JNXY"),
      5,

      10
    );
  });

  //User must have ETH deposited such that balance >= SELL order value
  it("Should only be possible when balance <= SELL order value", async function () {
    err = "";
    try {
      await dex.createLimitOrder(
        1,
        ethers.utils.formatBytes32String("JNXY"),
        5,
        10
      );
    } catch (e) {
      err = e.message;
    }
    expect(err).to.equal(
      "VM Exception while processing transaction: reverted with reason string 'Not enough balance!'"
    );

    await dex.deposit(100, ethers.utils.formatBytes32String("JNXY"), {
      value: 100,
    });
    await dex.createLimitOrder(
      1,
      ethers.utils.formatBytes32String("JNXY"),
      5,

      10
    );
  });

  //BUY order book in descending order.
  it("Should only be possible when BUY orderbook in descending order", async function () {
    await dex.depositEth({
      value: 5000,
    });

    await dex.createLimitOrder(
      0,
      ethers.utils.formatBytes32String("JNXY"),
      3,
      10
    );

    await dex.createLimitOrder(
      0,
      ethers.utils.formatBytes32String("JNXY"),
      10,
      15
    );
    await dex.createLimitOrder(
      0,
      ethers.utils.formatBytes32String("JNXY"),
      15,
      5
    );
    orderBook = await dex.getOrderBook(
      ethers.utils.formatBytes32String("JNXY"),
      0
    );
    console.log(orderBook);
    expect(orderBook.length) > 0;
    for (let i = 0; i < orderBook.length - 1; i++) {
      expect(orderBook[i].price > orderBook[i + 1].price);
    }
  });

  //SELL order book in ascending order.
  it("Should only be possible when SELL orderbook in ascending order", async function () {
    await jnxy.approve(dex.address, 5000);
    await dex.deposit(5000, ethers.utils.formatBytes32String("JNXY"));

    await dex.createMarketOrder(1, ethers.utils.formatBytes32String("JNXY"), 3);

    await dex.createLimitOrder(
      0,
      ethers.utils.formatBytes32String("JNXY"),
      10,
      15
    );
    await dex.createLimitOrder(
      0,
      ethers.utils.formatBytes32String("JNXY"),
      15,
      5
    );
    orderBook = await dex.getOrderBook(
      ethers.utils.formatBytes32String("JNXY"),
      0
    );
    console.log(orderBook);
    expect(orderBook.length) > 0;
    for (let i = 0; i < orderBook.length - 1; i++) {
      expect(orderBook[i].price > orderBook[i + 1].price);
    }
  });
});
