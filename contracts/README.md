# StreetPass Smart Contracts

This directory contains the Solidity smart contracts for the StreetPass location-based NFT game.

## Contracts

### LocationNFT.sol
ERC-721 NFT contract that mints unique location-based collectibles when users check in at real-world locations.

**Features:**
- Mints unique NFTs for each location check-in
- Stores location metadata (name, coordinates, category, rarity)
- Prevents duplicate check-ins at the same location
- Tracks all NFTs owned by each user
- Rarity scoring system (0-100)

**Key Functions:**
- `mintLocationNFT()`: Mint a new location NFT (owner only)
- `getUserTokens()`: Get all token IDs owned by a user
- `getLocationMetadata()`: Get location data for a token
- `hasUserCheckedIn()`: Check if user already visited a location

### StreetPassToken.sol
ERC-20 token contract for the in-game reward economy.

**Features:**
- Fixed maximum supply of 1 billion tokens
- Reward system based on check-in rarity
- Quest completion rewards
- Authorized minter system for backend integration
- Burn mechanism

**Key Functions:**
- `mintCheckInReward()`: Mint tokens for location check-ins (authorized minters)
- `mintQuestReward()`: Mint tokens for quest completion (authorized minters)
- `addMinter()`: Add authorized minter address (owner only)
- `burn()`: Burn tokens

## Deployment to Scroll

### Prerequisites

1. Install Hardhat and dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

2. Create a `.env.contracts` file:
```
SCROLL_RPC_URL=https://rpc.scroll.io
PRIVATE_KEY=your_deployer_private_key_here
SCROLL_SCAN_API_KEY=your_scrollscan_api_key_for_verification
```

### Deployment Steps

1. **Deploy to Scroll Testnet (Sepolia)**
```bash
npx hardhat run scripts/deploy.js --network scrollSepolia
```

2. **Deploy to Scroll Mainnet**
```bash
npx hardhat run scripts/deploy.js --network scroll
```

3. **Verify Contracts on ScrollScan**
```bash
npx hardhat verify --network scroll <CONTRACT_ADDRESS>
```

### Post-Deployment Setup

1. **Configure LocationNFT:**
   - Set backend service as authorized minter
   - Upload metadata to IPFS or configure metadata server

2. **Configure StreetPassToken:**
   - Add backend service as authorized minter
   - Consider adding LocationNFT contract as minter

3. **Update Frontend:**
   - Add contract addresses to `.env`:
     ```
     EXPO_PUBLIC_LOCATION_NFT_ADDRESS=0x...
     EXPO_PUBLIC_STREETPASS_TOKEN_ADDRESS=0x...
     ```
   - Update contract ABIs in `lib/contracts/` directory

## Integration with App

### Backend Service
The backend (Supabase Edge Function or custom API) should:
1. Verify user location proximity
2. Call `mintLocationNFT()` on successful check-in
3. Call `mintCheckInReward()` to award tokens
4. Update database with transaction hash and token ID

### Frontend
The app displays:
- User's NFT collection from contract
- Token balance
- Transaction history via blockchain explorer links

## Security Considerations

- Only owner can mint NFTs (centralized minting for MVP)
- Authorized minters list for token rewards
- Location verification happens off-chain (backend)
- Consider implementing on-chain location verification for full decentralization

## Gas Optimization

- Batch minting not currently implemented (future optimization)
- Metadata stored partially on-chain, partially off-chain
- Consider ERC721A for batch minting in future versions

## Testing

Create tests in `test/` directory:
```bash
npx hardhat test
```

## Future Enhancements

1. Implement trading/marketplace functionality
2. Add staking mechanism for tokens
3. Create achievement/badge system
4. Implement governance for location additions
5. Add on-chain location verification (oracle-based)
6. Multi-chain deployment (Arbitrum, Optimism, etc.)

## License

MIT License
