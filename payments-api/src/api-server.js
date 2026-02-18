import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import PaymentDB from './db.js';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 9000;
const db = new PaymentDB();

// ── Stripe setup ─────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-04-10',
});
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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

// ─────────────────────────────────────────────────────────
// STRIPE ROUTES
// ─────────────────────────────────────────────────────────

// POST /api/stripe/create-intent  — create a PaymentIntent for $29
app.post('/api/stripe/create-intent', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    const { root } = req.body;
    const num = parseInt(root);
    if (isNaN(num) || num < 100 || num > 999) {
      return res.status(400).json({ error: 'Invalid root. Must be 100-999.' });
    }

    // Check if root already claimed
    const existing = db.getPaymentByRoot(num);
    if (existing && existing.status === 'confirmed') {
      return res.status(409).json({ error: 'Root already claimed. Choose a different number.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2900, // $29.00 in cents
      currency: 'usd',
      metadata: {
        root: String(num),
        product: 'Y3K Genesis Root',
      },
      description: `Y3K Genesis Root #${num} — Permanent Namespace Registration`,
      statement_descriptor_suffix: `ROOT ${num}`,
    });

    res.status(201).json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      root: num,
      amount_usd: 29.00,
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (err) {
    console.error('Stripe create-intent error:', err.message);
    res.status(500).json({ error: err.message || 'Stripe error' });
  }
});

// GET /api/stripe/intent/:id  — check PaymentIntent status
app.get('/api/stripe/intent/:id', async (req, res) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({
      id: intent.id,
      status: intent.status,
      root: intent.metadata?.root,
      amount: intent.amount,
    });
  } catch (err) {
    res.status(404).json({ error: 'Payment intent not found' });
  }
});

// POST /api/stripe/webhook  — handle confirmed payments
// IMPORTANT: raw body needed for signature verification
app.post('/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    let event;
    try {
      if (STRIPE_WEBHOOK_SECRET && STRIPE_WEBHOOK_SECRET !== 'whsec_placeholder_run_stripe_listen') {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers['stripe-signature'],
          STRIPE_WEBHOOK_SECRET
        );
      } else {
        // No webhook secret set yet — parse raw body directly (dev mode)
        event = JSON.parse(req.body.toString());
      }
    } catch (err) {
      console.error('Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const root = parseInt(intent.metadata?.root);
      if (!isNaN(root)) {
        const paymentId = randomUUID();
        try {
          db.createPayment(paymentId, root, 'STRIPE', 29.00);
          db.confirmPayment?.(paymentId, intent.id, 1);
          console.log(`✅ Stripe payment confirmed: root #${root}, intent ${intent.id}`);
        } catch (dbErr) {
          console.error('DB error on webhook:', dbErr.message);
        }
      }
    }

    res.json({ received: true });
  }
);

// ─────────────────────────────────────────────────────────

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
