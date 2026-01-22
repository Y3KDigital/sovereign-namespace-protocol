import { ethers } from 'ethers';
import fetch from 'node-fetch';

class BlockchainMonitor {
  constructor(config) {
    this.config = config;
    
    // ETH provider
    this.ethProvider = new ethers.JsonRpcProvider(config.ethRpcUrl);
    
    // USDC/USDT contract addresses (Ethereum mainnet)
    this.contracts = {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    };
    
    // ERC20 ABI (only Transfer event)
    this.erc20Abi = [
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ];
  }

  // Get current BTC price in USD
  async getBTCPrice() {
    try {
      const response = await fetch(
        `${this.config.priceApi}?ids=bitcoin&vs_currencies=usd`
      );
      const data = await response.json();
      return data.bitcoin.usd;
    } catch (error) {
      console.error('❌ Failed to fetch BTC price:', error.message);
      return null;
    }
  }

  // Get current ETH price in USD
  async getETHPrice() {
    try {
      const response = await fetch(
        `${this.config.priceApi}?ids=ethereum&vs_currencies=usd`
      );
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('❌ Failed to fetch ETH price:', error.message);
      return null;
    }
  }

  // Check if amount matches expected USD value (with tolerance)
  matchesExpectedAmount(receivedAmount, asset, expectedUsd, prices) {
    if (asset === 'USDC' || asset === 'USDT') {
      // Stablecoins: ±$0.50 absolute tolerance
      return Math.abs(receivedAmount - expectedUsd) <= 0.5;
    }
    
    if (asset === 'BTC' && prices.btc) {
      const expectedBTC = expectedUsd / prices.btc;
      const tolerance = expectedBTC * this.config.priceTolerance;
      return Math.abs(receivedAmount - expectedBTC) <= tolerance;
    }
    
    if (asset === 'ETH' && prices.eth) {
      const expectedETH = expectedUsd / prices.eth;
      const tolerance = expectedETH * this.config.priceTolerance;
      return Math.abs(receivedAmount - expectedETH) <= tolerance;
    }
    
    return false;
  }

  // Monitor BTC transactions (using public API)
  async checkBTCTransactions(address) {
    try {
      // Using Blockchain.info API (public, no auth required)
      const response = await fetch(
        `https://blockchain.info/rawaddr/${address}?limit=50`
      );
      const data = await response.json();
      
      const transactions = [];
      for (const tx of data.txs || []) {
        // Find outputs to our address
        for (const out of tx.out) {
          if (out.addr === address) {
            const amountBTC = out.value / 100000000; // satoshis to BTC
            const confirmations = data.n_tx > 0 ? 
              (data.n_tx - data.txs.indexOf(tx)) : 0;
            
            transactions.push({
              txHash: tx.hash,
              amount: amountBTC,
              confirmations: tx.block_height ? 
                (data.n_tx - data.txs.indexOf(tx)) : 0,
              timestamp: tx.time
            });
          }
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('❌ Failed to check BTC transactions:', error.message);
      return [];
    }
  }

  // Monitor ETH transactions
  async checkETHTransactions(address, fromBlock = 'latest') {
    try {
      // Get native ETH transfers
      const currentBlock = await this.ethProvider.getBlockNumber();
      const lookbackBlocks = 1000; // ~3-4 hours
      const startBlock = Math.max(0, currentBlock - lookbackBlocks);
      
      const history = await this.ethProvider.send('eth_getLogs', [{
        fromBlock: ethers.toQuantity(startBlock),
        toBlock: 'latest',
        address: null,
        topics: null
      }]);
      
      // Get incoming transfers
      const filter = {
        address: address,
        fromBlock: startBlock
      };
      
      const logs = await this.ethProvider.getLogs(filter);
      
      const transactions = [];
      
      // Check direct ETH transfers
      for (let i = startBlock; i <= currentBlock; i += 100) {
        const endBlock = Math.min(i + 99, currentBlock);
        const block = await this.ethProvider.getBlock(endBlock, true);
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
              const receipt = await this.ethProvider.getTransactionReceipt(tx.hash);
              const amountETH = parseFloat(ethers.formatEther(tx.value));
              
              if (amountETH > 0) {
                transactions.push({
                  txHash: tx.hash,
                  amount: amountETH,
                  confirmations: currentBlock - receipt.blockNumber,
                  timestamp: block.timestamp
                });
              }
            }
          }
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('❌ Failed to check ETH transactions:', error.message);
      return [];
    }
  }

  // Monitor USDC/USDT transactions
  async checkStablecoinTransactions(asset, address) {
    try {
      const contractAddress = this.contracts[asset];
      if (!contractAddress) {
        throw new Error(`Unknown asset: ${asset}`);
      }
      
      const contract = new ethers.Contract(
        contractAddress,
        this.erc20Abi,
        this.ethProvider
      );
      
      const currentBlock = await this.ethProvider.getBlockNumber();
      const lookbackBlocks = 1000;
      const startBlock = Math.max(0, currentBlock - lookbackBlocks);
      
      // Get Transfer events to our address
      const filter = contract.filters.Transfer(null, address);
      const events = await contract.queryFilter(filter, startBlock, 'latest');
      
      const transactions = [];
      for (const event of events) {
        const receipt = await this.ethProvider.getTransactionReceipt(event.transactionHash);
        const decimals = asset === 'USDC' ? 6 : 6; // Both use 6 decimals
        const amount = parseFloat(ethers.formatUnits(event.args.value, decimals));
        
        transactions.push({
          txHash: event.transactionHash,
          amount: amount,
          confirmations: currentBlock - receipt.blockNumber,
          timestamp: (await this.ethProvider.getBlock(receipt.blockNumber)).timestamp
        });
      }
      
      return transactions;
    } catch (error) {
      console.error(`❌ Failed to check ${asset} transactions:`, error.message);
      return [];
    }
  }

  // Main monitoring function
  async checkPayment(payment) {
    const prices = {
      btc: await this.getBTCPrice(),
      eth: await this.getETHPrice()
    };
    
    let transactions = [];
    
    switch (payment.asset) {
      case 'BTC':
        transactions = await this.checkBTCTransactions(this.config.walletBTC);
        break;
      case 'ETH':
        transactions = await this.checkETHTransactions(this.config.walletETH);
        break;
      case 'USDC':
      case 'USDT':
        transactions = await this.checkStablecoinTransactions(
          payment.asset,
          this.config.walletETH
        );
        break;
    }
    
    // Filter for matching transactions
    const matches = transactions.filter(tx => {
      // Skip if already assigned to another payment
      if (payment.tx_hash && payment.tx_hash !== tx.txHash) {
        return false;
      }
      
      // Check amount matches
      if (!this.matchesExpectedAmount(
        tx.amount,
        payment.asset,
        payment.expected_usd,
        prices
      )) {
        return false;
      }
      
      // Check timestamp is after payment creation
      if (tx.timestamp < payment.created_at) {
        return false;
      }
      
      return true;
    });
    
    // Return best match (highest confirmations)
    if (matches.length > 0) {
      return matches.reduce((best, current) => 
        current.confirmations > best.confirmations ? current : best
      );
    }
    
    return null;
  }
}

export default BlockchainMonitor;
