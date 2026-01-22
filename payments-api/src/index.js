import dotenv from 'dotenv';
import PaymentDB from './db.js';
import BlockchainMonitor from './monitor.js';

dotenv.config();

// Configuration
const config = {
  walletBTC: process.env.WALLET_BTC,
  walletETH: process.env.WALLET_ETH,
  ethRpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
  priceApi: process.env.PRICE_API || 'https://api.coingecko.com/api/v3/simple/price',
  btcConfirmations: parseInt(process.env.BTC_CONFIRMATIONS || '6'),
  ethConfirmations: parseInt(process.env.ETH_CONFIRMATIONS || '12'),
  expectedUsd: parseFloat(process.env.EXPECTED_USD || '29.00'),
  priceTolerance: parseFloat(process.env.PRICE_TOLERANCE || '0.02'),
  pollInterval: parseInt(process.env.POLL_INTERVAL || '30') * 1000,
  paymentWindowHours: parseInt(process.env.PAYMENT_WINDOW_HOURS || '24'),
  dbPath: process.env.DB_PATH,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Validate configuration
if (!config.walletBTC || !config.walletETH) {
  console.error('❌ Missing wallet addresses in .env');
  process.exit(1);
}

// Initialize
const db = new PaymentDB(config.dbPath);
const monitor = new BlockchainMonitor(config);

// Logging
function log(level, message, data = null) {
  const levels = ['debug', 'info', 'warn', 'error'];
  if (levels.indexOf(level) < levels.indexOf(config.logLevel)) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const prefix = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  }[level];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Main monitoring loop
async function monitorPayments() {
  log('info', '🔄 Starting payment monitoring cycle...');
  
  try {
    // Get pending payments within time window
    const pendingPayments = db.getPendingPayments(config.paymentWindowHours);
    log('info', `📋 Found ${pendingPayments.length} pending payments`);
    
    for (const payment of pendingPayments) {
      log('debug', `Checking payment ${payment.id} for root ${payment.root}`, {
        asset: payment.asset,
        expected_usd: payment.expected_usd
      });
      
      // Check blockchain for matching transaction
      const match = await monitor.checkPayment(payment);
      
      if (match) {
        log('info', `✅ Found matching transaction for payment ${payment.id}`, {
          tx_hash: match.txHash,
          amount: match.amount,
          confirmations: match.confirmations
        });
        
        // Update transaction info
        db.updateTransaction(
          payment.id,
          match.txHash,
          match.confirmations,
          'pending'
        );
        
        // Check if enough confirmations
        const requiredConfirmations = payment.asset === 'BTC' ? 
          config.btcConfirmations : 
          config.ethConfirmations;
        
        if (match.confirmations >= requiredConfirmations) {
          log('info', `🎉 Payment ${payment.id} confirmed!`, {
            root: payment.root,
            tx_hash: match.txHash,
            confirmations: match.confirmations
          });
          
          db.confirmPayment(payment.id);
        } else {
          log('info', `⏳ Waiting for confirmations: ${match.confirmations}/${requiredConfirmations}`);
        }
      } else {
        log('debug', `⏳ No matching transaction yet for payment ${payment.id}`);
      }
    }
    
    log('info', '✅ Monitoring cycle complete');
    
  } catch (error) {
    log('error', 'Failed to monitor payments:', error);
  }
}

// Graceful shutdown
function shutdown() {
  log('info', '🛑 Shutting down payment monitor...');
  db.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start monitoring
log('info', '🚀 Genesis Payment Monitor v1.0.0');
log('info', `📡 Monitoring wallets:`, {
  BTC: config.walletBTC,
  ETH: config.walletETH
});
log('info', `⚙️ Configuration:`, {
  poll_interval: `${config.pollInterval / 1000}s`,
  btc_confirmations: config.btcConfirmations,
  eth_confirmations: config.ethConfirmations,
  expected_usd: `$${config.expectedUsd}`,
  price_tolerance: `${config.priceTolerance * 100}%`
});

// Initial run
monitorPayments();

// Set up interval
setInterval(monitorPayments, config.pollInterval);
