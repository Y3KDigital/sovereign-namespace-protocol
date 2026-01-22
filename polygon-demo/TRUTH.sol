// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TRUTH Token
 * @dev Representing the truth about Unstoppable Domains' 500,000x markup
 * 
 * Supply: 955,000,000 TRUTH (matching Y3K's 955 genesis namespaces)
 * Symbol: TRUTH
 * Decimals: 18
 * 
 * This token demonstrates:
 * - UD charges $51,546 for crypto.x ($0.01 cost = 5,154,600x markup)
 * - Y3K charges $7,500 for same tech (85% cheaper)
 * - Y3K has 955 genesis-locked supply (UD unlimited)
 * - Y3K offers unlimited sub-namespaces (UD offers 0)
 * 
 * TRUTH supply = 955 million (representing the 955 Y3K namespaces)
 * Each namespace could represent 1 million TRUTH in its "truth economy"
 */
contract TRUTH is ERC20 {
    constructor() ERC20("Truth Token", "TRUTH") {
        // Mint 955 million TRUTH tokens
        _mint(msg.sender, 955_000_000 * 10**18);
    }
}
