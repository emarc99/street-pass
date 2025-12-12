// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StreetPassToken
 * @dev ERC20 token for StreetPass rewards and in-game economy
 * Users earn tokens by checking in at locations and completing quests
 */
contract StreetPassToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant CHECK_IN_REWARD = 10 * 10**18; // 10 tokens per check-in

    mapping(address => bool) public authorizedMinters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewardMinted(address indexed to, uint256 amount, string reason);

    constructor() ERC20("StreetPass Token", "STREET") Ownable(msg.sender) {
        authorizedMinters[msg.sender] = true;
    }

    /**
     * @dev Add an authorized minter (e.g., backend service)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove an authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint rewards for check-ins
     */
    function mintCheckInReward(address to, uint8 rarityScore) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Invalid recipient");

        // Calculate reward based on rarity (10-50 tokens)
        uint256 baseReward = CHECK_IN_REWARD;
        uint256 rarityMultiplier = 1 + (rarityScore / 20); // 1x to 5x multiplier
        uint256 rewardAmount = baseReward * rarityMultiplier;

        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "Max supply exceeded");

        _mint(to, rewardAmount);
        emit RewardMinted(to, rewardAmount, "check-in");
    }

    /**
     * @dev Mint rewards for quest completion
     */
    function mintQuestReward(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Invalid recipient");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");

        _mint(to, amount);
        emit RewardMinted(to, amount, "quest");
    }

    /**
     * @dev Mint rewards for custom events (owner only for special occasions)
     */
    function mintSpecialReward(address to, uint256 amount, string memory reason) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");

        _mint(to, amount);
        emit RewardMinted(to, amount, reason);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Get user balance in readable format
     */
    function getUserBalance(address user) external view returns (uint256) {
        return balanceOf(user);
    }
}
