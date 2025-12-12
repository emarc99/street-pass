// Hardhat deployment script for StreetPass contracts
// Run with: npx hardhat run contracts/deploy.js --network scroll

const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Scroll...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

  console.log("\n1. Deploying LocationNFT...");
  const LocationNFT = await hre.ethers.getContractFactory("LocationNFT");
  const locationNFT = await LocationNFT.deploy();
  await locationNFT.deployed();
  console.log("✅ LocationNFT deployed to:", locationNFT.address);

  console.log("\n2. Deploying StreetPassToken...");
  const StreetPassToken = await hre.ethers.getContractFactory("StreetPassToken");
  const streetPassToken = await StreetPassToken.deploy();
  await streetPassToken.deployed();
  console.log("✅ StreetPassToken deployed to:", streetPassToken.address);

  console.log("\n3. Configuring contracts...");

  console.log("\nDeployment complete! 🎉\n");
  console.log("Contract Addresses:");
  console.log("==================");
  console.log("LocationNFT:", locationNFT.address);
  console.log("StreetPassToken:", streetPassToken.address);

  console.log("\n\nAdd these to your .env file:");
  console.log("============================");
  console.log(`EXPO_PUBLIC_LOCATION_NFT_ADDRESS=${locationNFT.address}`);
  console.log(`EXPO_PUBLIC_STREETPASS_TOKEN_ADDRESS=${streetPassToken.address}`);

  console.log("\n\nVerify contracts on ScrollScan:");
  console.log("================================");
  console.log(`npx hardhat verify --network scroll ${locationNFT.address}`);
  console.log(`npx hardhat verify --network scroll ${streetPassToken.address}`);

  console.log("\n\nImportant Next Steps:");
  console.log("====================");
  console.log("1. Add backend service address as authorized minter for StreetPassToken");
  console.log("   await streetPassToken.addMinter(BACKEND_ADDRESS)");
  console.log("\n2. Update frontend with contract addresses in .env");
  console.log("\n3. Configure metadata URI base for LocationNFT");
  console.log("\n4. Test minting functions on testnet before mainnet launch");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
