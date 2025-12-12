# StreetPass Deployment Guide

Complete step-by-step guide to deploy StreetPass to production.

## Prerequisites

- Node.js 18+ installed
- Wallet with ETH on Scroll network for contract deployment
- Supabase project (already configured)
- ScrollScan API key for contract verification

## Phase 1: Database Setup ✅

Already completed! The database includes:
- User management system
- Location database (50+ locations across 10 major cities)
- Check-in tracking
- Quest system with automatic progress tracking
- Location statistics

## Phase 2: Smart Contract Deployment

### Step 1: Install Contract Dependencies

```bash
npm run contracts:install
```

This installs:
- Hardhat (smart contract development framework)
- OpenZeppelin contracts (ERC-721 and ERC-20 implementations)
- Hardhat toolbox (testing and verification tools)

### Step 2: Get Deployment Wallet Ready

1. Create a new wallet for deployment (or use existing)
2. Fund wallet with ETH on Scroll network
   - Estimated gas cost: ~0.01 ETH for both contracts
3. Export private key from wallet

### Step 3: Get ScrollScan API Key

1. Go to https://scrollscan.com
2. Create account and get API key
3. This is needed for contract verification

### Step 4: Configure Environment

Create `.env.contracts` file in project root:

```bash
PRIVATE_KEY=your_deployer_wallet_private_key_without_0x_prefix
SCROLL_SCAN_API_KEY=your_scrollscan_api_key_here
```

### Step 5: Test on Sepolia Testnet (Recommended)

```bash
# Deploy to Scroll Sepolia testnet
npm run contracts:deploy:testnet
```

This will output contract addresses. Save them!

### Step 6: Deploy to Mainnet

```bash
# Deploy to Scroll mainnet
npm run contracts:deploy:mainnet
```

Save the contract addresses from the output:
- LocationNFT: 0x...
- StreetPassToken: 0x...

### Step 7: Verify Contracts

```bash
# Verify LocationNFT
npx hardhat verify --network scroll <LOCATION_NFT_ADDRESS>

# Verify StreetPassToken
npx hardhat verify --network scroll <STREETPASS_TOKEN_ADDRESS>
```

### Step 8: Configure Contract Permissions

You need to add your backend service as an authorized minter for the token contract.

Using ethers.js or web3.js:

```javascript
const contract = new ethers.Contract(
  STREETPASS_TOKEN_ADDRESS,
  STREETPASS_TOKEN_ABI,
  signer
);

// Add backend wallet as authorized minter
await contract.addMinter(BACKEND_WALLET_ADDRESS);
```

## Phase 3: Backend Integration

### Option A: Supabase Edge Function (Recommended)

Create an edge function to handle NFT minting:

```typescript
// supabase/functions/mint-nft/index.ts
import { ethers } from 'ethers';

Deno.serve(async (req) => {
  // 1. Verify user authentication
  // 2. Verify location proximity (server-side)
  // 3. Call LocationNFT.mintLocationNFT()
  // 4. Call StreetPassToken.mintCheckInReward()
  // 5. Update database with transaction hash and token ID
});
```

### Option B: Custom Backend Service

Build a Node.js/Express backend that:
1. Receives check-in requests from app
2. Verifies user location
3. Mints NFT and rewards using contracts
4. Updates Supabase database

## Phase 4: Frontend Configuration

### Step 1: Update Environment Variables

Add to `.env`:

```bash
EXPO_PUBLIC_LOCATION_NFT_ADDRESS=0x...
EXPO_PUBLIC_STREETPASS_TOKEN_ADDRESS=0x...
```

### Step 2: Test Locally

```bash
npm run dev
# Press 'w' to open in browser
```

Test the following flows:
1. ✅ Connect wallet
2. ✅ Enable location permissions
3. ✅ View nearby locations
4. ✅ Enable test mode
5. ⚠️  Check in (will work after backend is deployed)
6. ✅ View collection
7. ✅ View quests
8. ✅ Update profile

## Phase 5: Metadata Setup

### Option A: IPFS (Decentralized)

1. Upload NFT images to IPFS
2. Create metadata JSON files
3. Upload metadata to IPFS
4. Use IPFS hash as tokenURI when minting

### Option B: Server (Centralized)

1. Host images on CDN (e.g., Cloudflare, AWS)
2. Create API endpoint: `/metadata/{tokenId}`
3. Return JSON metadata for each token
4. Use API URL as tokenURI when minting

Example metadata format:
```json
{
  "name": "Times Square Check-In",
  "description": "Checked in at Times Square on 2024-01-15",
  "image": "https://cdn.example.com/nft/1.png",
  "attributes": [
    {"trait_type": "Location", "value": "Times Square"},
    {"trait_type": "City", "value": "New York"},
    {"trait_type": "Rarity", "value": "Epic"},
    {"trait_type": "Category", "value": "Landmark"}
  ]
}
```

## Phase 6: Production Deployment

### Web Deployment (Vercel/Netlify)

```bash
npm run build:web
# Deploy dist folder to hosting platform
```

### Mobile Deployment

#### iOS
```bash
# Build for iOS
eas build --platform ios
```

#### Android
```bash
# Build for Android
eas build --platform android
```

## Phase 7: Post-Deployment

### Monitoring

1. Set up Supabase monitoring for database usage
2. Monitor contract transactions on ScrollScan
3. Set up error tracking (Sentry, LogRocket)
4. Monitor API rate limits

### Marketing

1. Create landing page
2. Prepare social media content
3. Submit to NFT marketplaces
4. Reach out to crypto gaming communities

### Maintenance

1. Weekly quest generation
2. Add new locations based on user requests
3. Monitor and respond to user feedback
4. Regular security audits

## Security Checklist

- [ ] Smart contracts verified on ScrollScan
- [ ] Private keys secured (never in code)
- [ ] RLS policies tested on database
- [ ] Rate limiting implemented on backend
- [ ] HTTPS enabled on all endpoints
- [ ] User data properly encrypted
- [ ] Smart contracts audited (recommended for production)

## Cost Estimation

### One-Time Costs
- Smart contract deployment: ~0.01 ETH (~$30)
- Contract verification: Free
- Domain name: $10-50/year

### Monthly Costs
- Supabase: $0-25 (depending on usage)
- Hosting: $0-20 (Vercel/Netlify free tier usually sufficient)
- IPFS/CDN: $0-50 (depending on traffic)

### Gas Costs (Ongoing)
- NFT mint: ~0.001 ETH per mint (~$3)
- Token mint: ~0.0005 ETH per mint (~$1.50)

**Important**: Consider implementing gas sponsorship for users or batch minting to reduce costs.

## Troubleshooting

### Contract Deployment Fails
- Check wallet has sufficient ETH
- Verify network configuration in hardhat.config.js
- Check Scroll RPC is responsive

### Frontend Can't Connect to Contracts
- Verify contract addresses in .env
- Check wallet is on Scroll network
- Verify contracts are deployed and verified

### Database Errors
- Check Supabase connection string
- Verify RLS policies allow operations
- Check API rate limits

## Support

For issues or questions:
- Check GitHub issues
- Review Scroll documentation: https://docs.scroll.io
- Join Scroll Discord: https://discord.gg/scroll

## Next Steps

After deployment, consider:
1. Adding marketplace functionality for NFT trading
2. Implementing staking for tokens
3. Creating seasonal events and special quests
4. Partnering with local businesses for sponsored locations
5. Multi-chain deployment (Arbitrum, Optimism, etc.)
