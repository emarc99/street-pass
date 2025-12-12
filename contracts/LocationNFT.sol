// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LocationNFT
 * @dev ERC721 NFT contract for StreetPass location-based collectibles
 * Each NFT represents a unique check-in at a real-world location
 */
contract LocationNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct LocationMetadata {
        string locationName;
        string locationAddress;
        int256 latitude;
        int256 longitude;
        string category;
        uint8 rarityScore;
        uint256 checkInTimestamp;
    }

    mapping(uint256 => LocationMetadata) public locationMetadata;
    mapping(address => uint256[]) public userTokens;
    mapping(address => mapping(string => uint256)) public userLocationCheckIns;

    event LocationCheckedIn(
        address indexed user,
        uint256 indexed tokenId,
        string locationName,
        uint8 rarityScore
    );

    constructor() ERC721("StreetPass Location NFT", "SPLOC") Ownable(msg.sender) {}

    /**
     * @dev Mint a new location NFT when user checks in
     * @param to Address of the user checking in
     * @param locationName Name of the location
     * @param locationAddress Physical address
     * @param latitude Location latitude (multiplied by 1e6)
     * @param longitude Location longitude (multiplied by 1e6)
     * @param category Location category
     * @param rarityScore Calculated rarity score (0-100)
     * @param tokenURI IPFS or server URI for NFT metadata
     */
    function mintLocationNFT(
        address to,
        string memory locationName,
        string memory locationAddress,
        int256 latitude,
        int256 longitude,
        string memory category,
        uint8 rarityScore,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(rarityScore <= 100, "Rarity score must be <= 100");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        locationMetadata[tokenId] = LocationMetadata({
            locationName: locationName,
            locationAddress: locationAddress,
            latitude: latitude,
            longitude: longitude,
            category: category,
            rarityScore: rarityScore,
            checkInTimestamp: block.timestamp
        });

        userTokens[to].push(tokenId);
        userLocationCheckIns[to][locationName] = tokenId;

        emit LocationCheckedIn(to, tokenId, locationName, rarityScore);

        return tokenId;
    }

    /**
     * @dev Get all token IDs owned by a user
     */
    function getUserTokens(address user) public view returns (uint256[] memory) {
        return userTokens[user];
    }

    /**
     * @dev Get location metadata for a token
     */
    function getLocationMetadata(uint256 tokenId) public view returns (LocationMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return locationMetadata[tokenId];
    }

    /**
     * @dev Check if user has already checked in at a location
     */
    function hasUserCheckedIn(address user, string memory locationName) public view returns (bool) {
        return userLocationCheckIns[user][locationName] != 0;
    }

    /**
     * @dev Get total number of NFTs minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
