# StreetPass Changelog

## Version 1.0.0 - MVP Release

### Features Implemented ✅

#### Frontend
- ✅ Tab-based navigation (Map, Quests, Collection, Profile)
- ✅ Wallet connection with MetaMask (Scroll blockchain)
- ✅ Disconnect wallet functionality with visible button
- ✅ Test Mode for development (check in from any distance)
- ✅ Real-time location tracking with expo-location
- ✅ Distance calculation for nearby locations
- ✅ Check-in validation (100m proximity)
- ✅ Dynamic rarity calculation based on time and location
- ✅ NFT collection gallery with rarity filters
- ✅ Quest progress tracking
- ✅ User profile with stats and achievements
- ✅ Username customization

#### Backend (Supabase)
- ✅ Complete database schema with 6 tables
- ✅ Row Level Security policies for data protection
- ✅ Automatic quest progress tracking (triggers)
- ✅ Location statistics tracking
- ✅ User level progression system
- ✅ 50+ locations across 10 major cities worldwide
- ✅ 8 initial quests with various objectives

#### Smart Contracts
- ✅ LocationNFT.sol (ERC-721)
  - Mints unique NFTs for location check-ins
  - Stores comprehensive location metadata
  - Tracks user collections
  - Prevents duplicate check-ins

- ✅ StreetPassToken.sol (ERC-20)
  - Reward token for check-ins and quests
  - Rarity-based reward multipliers
  - Authorized minter system
  - 1 billion token max supply

- ✅ Deployment scripts for Scroll blockchain
- ✅ Hardhat configuration for testnet and mainnet
- ✅ Contract integration utilities
- ✅ Complete deployment documentation

### Locations Added

**North America (15 locations)**
- New York City: 5 locations (Times Square, Statue of Liberty, Brooklyn Bridge Park, MoMA, Joe's Coffee)
- Los Angeles: 5 locations (Santa Monica Pier, Hollywood Sign, Venice Beach, The Broad, Blue Bottle)
- San Francisco: 5 locations (Golden Gate Bridge, Alcatraz, Golden Gate Park, SFMOMA, Philz Coffee)

**Europe (10 locations)**
- London: 5 locations (Big Ben, Tower Bridge, Hyde Park, Tate Modern, Monmouth Coffee)
- Paris: 5 locations (Eiffel Tower, Arc de Triomphe, Luxembourg Gardens, Louvre, Café de Flore)
- Berlin: 5 locations (Brandenburg Gate, Berlin Wall, Tiergarten, Berlin Museum, Five Elephant)

**Asia (10 locations)**
- Tokyo: 5 locations (Tokyo Tower, Shibuya Crossing, Yoyogi Park, teamLab, Blue Bottle)
- Singapore: 5 locations (Marina Bay Sands, Gardens by the Bay, Botanic Gardens, ArtScience Museum, Common Man Coffee)

**Middle East (5 locations)**
- Dubai: 5 locations (Burj Khalifa, Dubai Mall, Dubai Marina, Alserkal Avenue, % Arabica)

**Oceania (5 locations)**
- Sydney: 5 locations (Opera House, Harbour Bridge, Royal Botanic Garden, Art Gallery NSW, Single O)

### Quest System

**Quest Types Implemented:**
1. Visit Count - Check in at any N locations
2. Visit Category - Check in at N locations of specific category
3. Visit Specific - Check in at specific named locations

**Initial Quests:**
- First Steps: Check in at 3 locations (150 points)
- Cafe Crawler: Visit 5 cafes (250 points)
- Landmark Explorer: Visit 3 landmarks (300 points)
- Art Enthusiast: Visit 3 galleries (250 points)
- Park Wanderer: Visit 4 parks (200 points)
- Daily Challenge: 5 locations in one day (200 points)
- Weekend Explorer: 10 different locations (500 points)
- Night Owl: 3 locations after 8 PM (350 points)

### Rarity System

**Tiers:**
- Common (0-24%): Easy to find anytime
- Rare (25-49%): Less common locations
- Epic (50-74%): Special locations or nighttime
- Legendary (75-100%): Rare locations at night

**Calculation:**
- Base rarity from location tier (1-4)
- Night time bonus (8 PM - 6 AM): 1.5x multiplier
- Future: Popularity modifier based on check-in frequency

### Security

- ✅ Row Level Security on all database tables
- ✅ Wallet-based authentication
- ✅ Distance validation for check-ins
- ✅ Protected user data with RLS policies
- ✅ Smart contract ownership controls
- ✅ Authorized minter system for tokens

### Documentation

- ✅ Complete README with getting started guide
- ✅ Smart contract documentation
- ✅ Deployment guide with step-by-step instructions
- ✅ Contract README with architecture details
- ✅ This changelog

### Known Limitations

1. **Smart Contracts Not Yet Deployed**
   - Contracts are written and ready
   - Need wallet funding and deployment
   - Backend integration pending

2. **NFT Metadata Server**
   - Needs IPFS or server setup
   - Metadata format defined
   - Implementation pending

3. **Backend Service**
   - Need to create minting service (Supabase Edge Function or custom)
   - Server-side location verification needed
   - Gas sponsorship mechanism to be implemented

4. **Testing**
   - Smart contracts need unit tests
   - Integration tests needed
   - E2E testing pending

### What Works Right Now

1. ✅ Wallet connection and disconnection
2. ✅ Location discovery (50+ locations worldwide)
3. ✅ Test mode for development (check in from anywhere)
4. ✅ Database operations (check-ins, quests, user data)
5. ✅ Quest progress tracking (automatic)
6. ✅ Collection viewing (from database)
7. ✅ Profile management
8. ✅ Rarity calculation

### What Needs Smart Contracts

Once contracts are deployed, these features will be fully functional:
1. ⚠️ On-chain NFT minting
2. ⚠️ Token rewards distribution
3. ⚠️ Blockchain-verified ownership
4. ⚠️ NFT trading (future)

### Next Steps

1. Deploy smart contracts to Scroll testnet
2. Test minting flows
3. Deploy to mainnet
4. Build backend minting service
5. Set up NFT metadata hosting
6. Implement gas sponsorship
7. Add more locations
8. Launch marketing campaign

### Breaking Changes
None (initial release)

### Contributors
Built for the Scroll blockchain ecosystem.

---

## Future Releases

### Planned for v1.1.0
- Trading/marketplace functionality
- Achievement system
- Social features (friends, leaderboards)
- Push notifications
- AR camera overlay for check-ins

### Planned for v1.2.0
- Staking mechanism
- Governance for location additions
- Multi-chain support
- Batch minting optimization
- Mobile app optimization

### Planned for v2.0.0
- Full decentralization
- DAO governance
- Community-driven location curation
- Merchant partnerships
- Revenue sharing model
