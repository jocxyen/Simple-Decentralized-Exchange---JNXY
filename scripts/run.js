const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [owner, random] = await hre.ethers.getSigners();
  const Wallet = await hre.ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy();
  await wallet.deployed();
  console.log("Wallet deployed to:", wallet.address);

  const Jnxy = await hre.ethers.getContractFactory("JNXY");
  const jnxy = await Jnxy.deploy();
  await jnxy.deployed();
  console.log("JNXY token deployed to: ", jnxy.address);

  await wallet.addToken(ethers.utils.formatBytes32String("JNXY"), jnxy.address);
  await jnxy.approve(wallet.address, 500);
  await wallet.deposit(400, ethers.utils.formatBytes32String("JNXY"));
  let balance = await wallet.balances(
    owner.address,
    ethers.utils.formatBytes32String("JNXY")
  );
  console.log(new ethers.BigNumber.from(balance));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
