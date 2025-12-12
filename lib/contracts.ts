import { ethers } from 'ethers';

export const LOCATION_NFT_ABI = [
  "function mintLocationNFT(address to, string memory locationName, string memory locationAddress, int256 latitude, int256 longitude, string memory category, uint8 rarityScore, string memory tokenURI) public returns (uint256)",
  "function getUserTokens(address user) public view returns (uint256[] memory)",
  "function getLocationMetadata(uint256 tokenId) public view returns (tuple(string locationName, string locationAddress, int256 latitude, int256 longitude, string category, uint8 rarityScore, uint256 checkInTimestamp))",
  "function hasUserCheckedIn(address user, string memory locationName) public view returns (bool)",
  "function totalSupply() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)"
];

export const STREETPASS_TOKEN_ABI = [
  "function mintCheckInReward(address to, uint8 rarityScore) external",
  "function mintQuestReward(address to, uint256 amount) external",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function burn(uint256 amount) external",
  "function totalSupply() public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string memory)"
];

export const CONTRACT_ADDRESSES = {
  LOCATION_NFT: process.env.EXPO_PUBLIC_LOCATION_NFT_ADDRESS || '',
  STREETPASS_TOKEN: process.env.EXPO_PUBLIC_STREETPASS_TOKEN_ADDRESS || '',
};

export const SCROLL_NETWORK = {
  chainId: 534352,
  chainName: 'Scroll',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.scroll.io'],
  blockExplorerUrls: ['https://scrollscan.com'],
};

export const SCROLL_SEPOLIA_NETWORK = {
  chainId: 534351,
  chainName: 'Scroll Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia-rpc.scroll.io'],
  blockExplorerUrls: ['https://sepolia.scrollscan.com'],
};

export function getLocationNFTContract(
  provider: ethers.providers.Provider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.LOCATION_NFT,
    LOCATION_NFT_ABI,
    provider
  );
}

export function getStreetPassTokenContract(
  provider: ethers.providers.Provider | ethers.Signer
): ethers.Contract {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.STREETPASS_TOKEN,
    STREETPASS_TOKEN_ABI,
    provider
  );
}

export async function mintLocationNFT(
  signer: ethers.Signer,
  locationName: string,
  locationAddress: string,
  latitude: number,
  longitude: number,
  category: string,
  rarityScore: number,
  tokenURI: string
): Promise<{ tokenId: string; transactionHash: string }> {
  const contract = getLocationNFTContract(signer);
  const userAddress = await signer.getAddress();

  const latitudeInt = Math.floor(latitude * 1e6);
  const longitudeInt = Math.floor(longitude * 1e6);

  const tx = await contract.mintLocationNFT(
    userAddress,
    locationName,
    locationAddress,
    latitudeInt,
    longitudeInt,
    category,
    rarityScore,
    tokenURI
  );

  const receipt = await tx.wait();
  const event = receipt.events?.find((e: any) => e.event === 'LocationCheckedIn');
  const tokenId = event?.args?.tokenId.toString();

  return {
    tokenId,
    transactionHash: receipt.transactionHash,
  };
}

export async function getUserNFTs(
  provider: ethers.providers.Provider,
  userAddress: string
): Promise<string[]> {
  const contract = getLocationNFTContract(provider);
  const tokenIds = await contract.getUserTokens(userAddress);
  return tokenIds.map((id: ethers.BigNumber) => id.toString());
}

export async function getNFTMetadata(
  provider: ethers.providers.Provider,
  tokenId: string
): Promise<any> {
  const contract = getLocationNFTContract(provider);
  const metadata = await contract.getLocationMetadata(tokenId);
  return {
    locationName: metadata.locationName,
    locationAddress: metadata.locationAddress,
    latitude: metadata.latitude.toNumber() / 1e6,
    longitude: metadata.longitude.toNumber() / 1e6,
    category: metadata.category,
    rarityScore: metadata.rarityScore,
    checkInTimestamp: metadata.checkInTimestamp.toNumber(),
  };
}

export async function getTokenBalance(
  provider: ethers.providers.Provider,
  userAddress: string
): Promise<string> {
  const contract = getStreetPassTokenContract(provider);
  const balance = await contract.balanceOf(userAddress);
  return ethers.utils.formatEther(balance);
}

export function getExplorerUrl(type: 'tx' | 'address' | 'token', value: string): string {
  const baseUrl = 'https://scrollscan.com';

  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${value}`;
    case 'address':
      return `${baseUrl}/address/${value}`;
    case 'token':
      return `${baseUrl}/token/${value}`;
    default:
      return baseUrl;
  }
}
