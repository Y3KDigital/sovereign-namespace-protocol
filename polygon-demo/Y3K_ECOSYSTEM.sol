// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Y3K Token Ecosystem - Complete Deployment
 * @dev Deploys entire token ecosystem in one transaction
 * 
 * ARCHITECTURE (3 Layers):
 * 1. TLD Layer: .x, .z, .1, etc. (protocol infrastructure, NOT for sale)
 * 2. ROOT Layer: kevan.1, crypto.x, ryan.z (955 ROOTS - FOR SALE)
 * 3. SUBDOMAIN Layer: auth.kevan.1, pay.crypto.x (unlimited, FREE with root)
 * 
 * Includes:
 * 1. TRUTH Token (ERC-20) - 955M supply (matches 955 roots)
 * 2. Y3K Root NFT (ERC-721) - Each NFT = 1 root namespace
 * 3. Subdomain Registry - Unlimited subs per root (free utility)
 * 4. ERC-6551 Account - Token-bound accounts for each root
 * 
 * KEY: You sell ROOTS (kevan.1), not TLDs (.x) or subdomains (auth.kevan.1)
 */

// ============================================================================
// 1. TRUTH TOKEN (ERC-20)
// ============================================================================

contract TRUTH is ERC20 {
    constructor() ERC20("Truth Token", "TRUTH") {
        // 955 million TRUTH (matching 955 genesis namespaces)
        _mint(msg.sender, 955_000_000 * 10**18);
    }
}

// ============================================================================
// 2. Y3K NAMESPACE NFT (ERC-721)
// ============================================================================

contract Y3KNamespace is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Root Namespace data (the scarce asset)
    struct Namespace {
        string name;           // e.g., "crypto.x" (ROOT, not TLD)
        address owner;
        uint256 createdAt;
        bool soulbound;
    }
    
    // Subdomain registry (free utility layer, unlimited per root)
    struct Subdomain {
        string name;           // e.g., "auth.crypto.x" (subdomain of crypto.x ROOT)
        uint256 parentTokenId; // Parent root NFT (e.g., crypto.x)
        address owner;
        uint256 createdAt;
    }
    
    mapping(uint256 => Namespace) public namespaces;
    mapping(uint256 => Subdomain[]) public subdomains;
    mapping(uint256 => bool) public isLocked; // Soulbound flag
    
    event NamespaceMinted(uint256 indexed tokenId, string name, address owner);
    event SubdomainCreated(uint256 indexed parentTokenId, string subdomain, address owner);
    event NamespaceLocked(uint256 indexed tokenId);
    
    constructor() ERC721("Y3K Namespace", "Y3K") Ownable(msg.sender) {}
    
    /**
     * @dev Mint namespace NFT
     */
    function mintNamespace(address to, string memory name) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        
        namespaces[tokenId] = Namespace({
            name: name,
            owner: to,
            createdAt: block.timestamp,
            soulbound: false
        });
        
        emit NamespaceMinted(tokenId, name, to);
        return tokenId;
    }
    
    /**
     * @dev Create subdomain under namespace
     */
    function createSubdomain(uint256 parentTokenId, string memory subName) public {
        require(ownerOf(parentTokenId) == msg.sender, "Not namespace owner");
        
        Subdomain memory newSub = Subdomain({
            name: subName,
            parentTokenId: parentTokenId,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        subdomains[parentTokenId].push(newSub);
        emit SubdomainCreated(parentTokenId, subName, msg.sender);
    }
    
    /**
     * @dev Lock namespace (make soulbound)
     */
    function lockNamespace(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        isLocked[tokenId] = true;
        namespaces[tokenId].soulbound = true;
        emit NamespaceLocked(tokenId);
    }
    
    /**
     * @dev Override transfer to respect soulbound
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        require(!isLocked[tokenId], "Token is soulbound");
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Get all subdomains for a namespace
     */
    function getSubdomains(uint256 tokenId) public view returns (Subdomain[] memory) {
        return subdomains[tokenId];
    }
}

// ============================================================================
// 3. ERC-6551 ACCOUNT IMPLEMENTATION
// ============================================================================

interface IERC6551Account {
    function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId);
    function owner() external view returns (address);
}

contract Y3KAccount is IERC6551Account {
    uint256 private _chainId;
    address private _tokenContract;
    uint256 private _tokenId;
    
    receive() external payable {}
    
    function token() external view returns (uint256, address, uint256) {
        return (_chainId, _tokenContract, _tokenId);
    }
    
    function owner() external view returns (address) {
        if (_chainId != block.chainid) return address(0);
        return ERC721(_tokenContract).ownerOf(_tokenId);
    }
    
    function initialize(uint256 chainId, address tokenContract, uint256 tokenId) external {
        require(_chainId == 0, "Already initialized");
        _chainId = chainId;
        _tokenContract = tokenContract;
        _tokenId = tokenId;
    }
    
    // Allow account to execute arbitrary transactions
    function execute(address to, uint256 value, bytes calldata data) external payable returns (bytes memory) {
        require(msg.sender == this.owner(), "Not token owner");
        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "Execution failed");
        return result;
    }
    
    // ERC-20 token receiver
    function onERC20Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC20Received.selector;
    }
    
    // ERC-721 token receiver
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

// ============================================================================
// 4. ERC-6551 REGISTRY
// ============================================================================

contract Y3KRegistry {
    event AccountCreated(
        address account,
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    );
    
    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(chainId, tokenContract, tokenId));
        
        // Create deterministic address
        address account = address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(abi.encodePacked(
                type(Y3KAccount).creationCode,
                abi.encode(implementation)
            ))
        )))));
        
        // Deploy if not exists
        if (account.code.length == 0) {
            new Y3KAccount{salt: salt}();
            Y3KAccount(payable(account)).initialize(chainId, tokenContract, tokenId);
        }
        
        emit AccountCreated(account, implementation, chainId, tokenContract, tokenId);
        return account;
    }
    
    function getAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(chainId, tokenContract, tokenId));
        
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(abi.encodePacked(
                type(Y3KAccount).creationCode,
                abi.encode(implementation)
            ))
        )))));
    }
}

// ============================================================================
// 5. DEPLOYMENT FACTORY
// ============================================================================

contract Y3KEcosystemFactory {
    event EcosystemDeployed(
        address truth,
        address namespaceNFT,
        address accountImpl,
        address registry
    );
    
    struct DeployedContracts {
        address truthToken;
        address namespaceNFT;
        address accountImplementation;
        address registry;
    }
    
    function deployEcosystem() external returns (DeployedContracts memory) {
        // 1. Deploy TRUTH token
        TRUTH truth = new TRUTH();
        
        // 2. Deploy Namespace NFT
        Y3KNamespace namespace = new Y3KNamespace();
        
        // 3. Deploy Account implementation
        Y3KAccount accountImpl = new Y3KAccount();
        
        // 4. Deploy Registry
        Y3KRegistry registry = new Y3KRegistry();
        
        // Transfer ownership to deployer
        namespace.transferOwnership(msg.sender);
        
        // Transfer all TRUTH tokens to deployer
        truth.transfer(msg.sender, truth.balanceOf(address(this)));
        
        emit EcosystemDeployed(
            address(truth),
            address(namespace),
            address(accountImpl),
            address(registry)
        );
        
        return DeployedContracts({
            truthToken: address(truth),
            namespaceNFT: address(namespace),
            accountImplementation: address(accountImpl),
            registry: address(registry)
        });
    }
}
