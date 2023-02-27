const { ethers } = require("hardhat");

async function main() {
    //fetch contract
    const Token = await ethers.getContractFactory("Token")
    //Deploy contract
    const token = await Token.deploy()
    await token.deployed()

    console.log(token.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
