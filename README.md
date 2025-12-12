# StreetPass

A location-based crypto rewards game where users collect unique NFTs by visiting real-world locations. Built with React Native Expo and powered by Scroll blockchain.

## Features

### Core Gameplay
- **Location Discovery**: Find nearby locations on an interactive map
- **Check-In System**: Visit locations within 100 meters to check in
- **NFT Collection**: Automatically mint location-based NFTs on check-in
- **Dynamic Rarity**: NFT rarity based on location popularity and time of day

### Quest System
- **Daily Quests**: Complete location-based challenges
- **Progress Tracking**: Real-time quest progress updates
- **Rewards**: Earn points for completing quests

### User Profile
- **Wallet Integration**: Connect with MetaMask or other Web3 wallets
- **Stats Tracking**: View total points, level, and achievements
- **Collection Gallery**: Browse collected NFTs with rarity filters
- **Username Customization**: Personalize your profile

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Scroll (Ethereum L2)
- **Wallet Integration**: Web3 with Ethers.js
- **Location Services**: Expo Location
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- A Web3 wallet (MetaMask, Trust Wallet, etc.)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open the app:
- **Web**: Press `w` to open in browser
- **iOS**: Press `i` to open in iOS Simulator (macOS only)
- **Android**: Press `a` to open in Android Emulator

### Environment Variables

The following environment variables are configured in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_SCROLL_RPC_URL`: Scroll blockchain RPC endpoint
- `EXPO_PUBLIC_SCROLL_CHAIN_ID`: Scroll chain ID (534352)

## How to Play

### 1. Connect Your Wallet
- Open the app and navigate to the Profile tab
- Click "Connect Wallet" to connect your Web3 wallet
- Approve the connection and switch to Scroll network if prompted

### 2. Discover Locations
- Go to the Map tab to see nearby locations
- Grant location permissions when prompted
- Browse locations sorted by distance

### 3. Check In
- Walk to a location (within 100 meters)
- Tap the location card to check in
- Confirm the transaction to mint your location NFT

### 4. Complete Quests
- Navigate to the Quests tab
- View active daily quests
- Check in at locations to progress quests
- Claim rewards when quests are completed

### 5. View Your Collection
- Go to the Collection tab
- Browse your collected NFTs
- Filter by rarity: Common, Rare, Epic, Legendary
- View detailed stats for each NFT

## Rarity System

NFT rarity is calculated based on:

1. **Location Base Rarity**: Each location has a base rarity tier (1-4)
2. **Time of Day**: Checking in at night (8pm-6am) increases rarity by 50%
3. **Location Popularity**: Less visited locations have higher base rarity

### Rarity Tiers
- **Common** (0-24%): Easy to find anytime
- **Rare** (25-49%): Less common locations
- **Epic** (50-74%): Special locations or nighttime check-ins
- **Legendary** (75-100%): Rare locations checked in at night

## Database Schema

### Tables

- **users**: User profiles with wallet addresses and stats
- **locations**: Real-world locations for check-ins
- **check_ins**: Record of user check-ins with NFT data
- **quests**: Available quests with requirements
- **user_quests**: User quest progress tracking
- **location_stats**: Popularity metrics for rarity calculation

## Smart Contracts

The app includes production-ready Solidity smart contracts in the `/contracts` directory:

- **LocationNFT.sol**: ERC-721 contract for location-based NFTs
- **StreetPassToken.sol**: ERC-20 token for quest rewards and check-in incentives

### Deploying Smart Contracts

1. **Install Contract Dependencies**
```bash
npm run contracts:install
```

2. **Configure Deployment**
Create a `.env.contracts` file:
```
PRIVATE_KEY=your_deployer_wallet_private_key
SCROLL_SCAN_API_KEY=your_scrollscan_api_key
```

3. **Deploy to Scroll Testnet (Sepolia)**
```bash
npm run contracts:deploy:testnet
```

4. **Deploy to Scroll Mainnet**
```bash
npm run contracts:deploy:mainnet
```

5. **Update App Configuration**
After deployment, add contract addresses to `.env`:
```
EXPO_PUBLIC_LOCATION_NFT_ADDRESS=0x...
EXPO_PUBLIC_STREETPASS_TOKEN_ADDRESS=0x...
```

6. **Verify Contracts on ScrollScan**
```bash
npx hardhat verify --network scroll <CONTRACT_ADDRESS>
```

See `/contracts/README.md` for detailed contract documentation.

## Security Features

- **Row Level Security**: Supabase RLS policies protect user data
- **Distance Validation**: Server-side check-in distance verification
- **Cooldown System**: Prevents multiple check-ins at same location within 24 hours
- **Rate Limiting**: Database-level constraints prevent spam

## Future Features

- Trading system for NFT exchange between users
- Team quests for group challenges
- Merchant sponsorships for local businesses
- AR camera overlay for check-ins
- Social features (friends, leaderboards)
- Push notifications for nearby locations and quest reminders

## Contributing

This is an MVP built for demonstration. Contributions are welcome!

## License

MIT License

## Support

For issues or questions, please open an issue on the GitHub repository.
