require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  // Place where you place your networks hardhat can connect to different networks and you can chose where to deploy your contracts.
  networks:{
    localhost:{},
    infura:{
      url: "https://mainnet.infura.io/v3/b3aa189a1b41450f9889603fba901e06",
      
    }
  }
};
