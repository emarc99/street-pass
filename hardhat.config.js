require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.contracts" });

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const SCROLL_SCAN_API_KEY = process.env.SCROLL_SCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    scroll: {
      url: "https://rpc.scroll.io",
      chainId: 534352,
      accounts: [PRIVATE_KEY],
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      chainId: 534351,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      scroll: SCROLL_SCAN_API_KEY,
      scrollSepolia: SCROLL_SCAN_API_KEY,
    },
    customChains: [
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com",
        },
      },
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
