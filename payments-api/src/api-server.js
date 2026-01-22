import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import PaymentDB from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;
const db = new PaymentDB();

// CORS - allow your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rate limiting map
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (limit.count >= 10) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'genesis-payment-api' });
});

// Create payment intent
app.post('/api/payment/create', (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { root, asset } = req.body;

    // Validate root
    const num = parseInt(root);
    if (isNaN(num) || num < 100 || num > 999) {
      return res.status(400).json({ error: 'Invalid root. Must be 100-999.' });
    }

    // Validate asset
    const validAssets = ['BTC', 'ETH', 'USDC', 'USDT'];
    if (!validAssets.includes(asset?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid asset.' });
    }

    // Check if root already claimed
    const existing = db.getPaymentByRoot(num);
    if (existing) {
      return res.status(409).json({ 
        error: 'Root already claimed. Choose a different number.' 
      });
    }

    // Create payment
    const paymentId = randomUUID();
    const payment = db.createPayment(paymentId, num, asset.toUpperCase(), 29.00);

    res.status(201).json({
      payment_id: payment.id,
      root: payment.root,
      asset: payment.asset,
      expected_usd: payment.expected_usd,
      wallet_addresses: {
        BTC: process.env.WALLET_BTC,
        ETH: process.env.WALLET_ETH,
        USDC: process.env.WALLET_ETH,
        USDT: process.env.WALLET_ETH
      },
      created_at: payment.created_at,
      expires_at: payment.created_at + (24 * 3600)
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check payment status
app.get('/api/payment/status/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const payment = db.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = payment.created_at + (24 * 3600);
    const isExpired = now > expiresAt && payment.status === 'pending';

    res.json({
      payment_id: payment.id,
      root: payment.root,
      asset: payment.asset,
      status: isExpired ? 'expired' : payment.status,
      tx_hash: payment.tx_hash,
      confirmations: payment.confirmations,
      created_at: payment.created_at,
      confirmed_at: payment.confirmed_at,
      expires_at: expiresAt,
      is_expired: isExpired
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Genesis Payment API running on http://localhost:${PORT}`);
  console.log(`📡 Monitoring payments to:`);
  console.log(`   BTC: ${process.env.WALLET_BTC}`);
  console.log(`   ETH: ${process.env.WALLET_ETH}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  db.close();
  process.exit(0);
});
