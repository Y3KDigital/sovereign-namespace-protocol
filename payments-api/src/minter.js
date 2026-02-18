/**
 * minter.js — On-chain NFT mint after payment confirmed
 *
 * Calls NumberRootNFT.ownerMintRoot() on Polygon Mainnet.
 * The contract owner (MINTER_PRIVATE_KEY wallet) pays the gas.
 * Buyer's wallet address becomes the NFT recipient via safeTransferFrom after mint.
 *
 * Flow:
 *   1. Stripe webhook fires payment_intent.succeeded
 *   2. API calls mintRootNFT(root, buyerWallet, metadata)
 *   3. We mint tokenId=root to ourselves (owner), then transfer to buyer
 *      OR: mint directly to buyer if contract supports it
 *   4. Return tx hash — stored in DB, shown on success page
 */

import { ethers } from 'ethers';

// ABI — only the functions we call
const NFT_ABI = [
  "function ownerMintRoot(uint256 root, string displayName, string phoneNumber, string ipfsCID, bool soulbound) external",
  "function isMinted(uint256 root) external view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
];

let _contract = null;
let _wallet   = null;

function getContract() {
  if (_contract) return { contract: _contract, wallet: _wallet };

  const rpc        = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
  const privateKey = process.env.MINTER_PRIVATE_KEY;
  const address    = process.env.NUMBER_ROOT_NFT;

  if (!privateKey || !address) {
    throw new Error('MINTER_PRIVATE_KEY and NUMBER_ROOT_NFT must be set in .env to mint NFTs');
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  _wallet        = new ethers.Wallet(privateKey, provider);
  _contract      = new ethers.Contract(address, NFT_ABI, _wallet);

  return { contract: _contract, wallet: _wallet };
}

/**
 * Mint a root NFT and optionally transfer to buyer's wallet.
 *
 * @param {number} root          — 100-999
 * @param {string} buyerWallet   — 0x... address (empty string = hold for manual transfer)
 * @param {string} displayName   — e.g. "888" or custom name
 * @param {string} phoneNumber   — optional e.g. "+18888550209"
 * @returns {{ txHash: string, tokenId: number, transferTxHash?: string }}
 */
export async function mintRootNFT(root, buyerWallet, displayName = '', phoneNumber = '') {
  const { contract, wallet } = getContract();

  // Check not already minted
  const alreadyMinted = await contract.isMinted(BigInt(root));
  if (alreadyMinted) {
    throw new Error(`Root #${root} is already minted on-chain`);
  }

  const name  = displayName || String(root);
  const phone = phoneNumber || '';
  const cid   = ''; // IPFS CID added later via updateProfile
  const soulbound = false;

  console.log(`⛓️  Minting root #${root} on Polygon...`);
  const mintTx = await contract.ownerMintRoot(BigInt(root), name, phone, cid, soulbound);
  const receipt = await mintTx.wait();
  console.log(`✅ Minted root #${root} — tx: ${mintTx.hash}`);

  let transferTxHash = null;

  // Transfer to buyer if wallet provided
  if (buyerWallet && ethers.isAddress(buyerWallet)) {
    console.log(`📤 Transferring #${root} to ${buyerWallet}...`);
    const transferTx = await contract.safeTransferFrom(wallet.address, buyerWallet, BigInt(root));
    await transferTx.wait();
    transferTxHash = transferTx.hash;
    console.log(`✅ Transferred #${root} to ${buyerWallet} — tx: ${transferTxHash}`);
  }

  return {
    txHash:         mintTx.hash,
    tokenId:        root,
    transferTxHash,
    polygonscan:    `https://polygonscan.com/token/${process.env.NUMBER_ROOT_NFT}?a=${root}`,
  };
}

/**
 * Get current total minted count from chain.
 * Used to calculate bonding curve price in real-time.
 */
export async function getMintedCount() {
  try {
    const { contract } = getContract();
    const total = await contract.totalSupply();
    return Number(total);
  } catch {
    return 0; // fallback if contract not deployed yet
  }
}
