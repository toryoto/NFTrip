import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL ?? "",
      accounts: [process.env.PRIVATE_SEPOLIA_ACCOUNT_KEY ?? ""],
    }
  }
};

export default config;
