/**
 * api-server.js — Y3K Genesis Payments API v3
 *
 * Routes:
 *   GET  /health
 *   GET  /api/price/:root           — live bonding curve price for a root
 *   GET  /api/price/summary         — full price schedule + minted count
 *   POST /api/stripe/create-intent  — create PaymentIntent (bonding curve price)
 *   GET  /api/stripe/intent/:id     — check intent status
 *   POST /api/stripe/webhook        — Stripe confirms → mint NFT on Polygon
 *   POST /api/payment/create        — legacy crypto payment (BTC/ETH/USDC/USDT)
 *   GET  /api/payment/status/:id    — check crypto payment status
 */

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import PaymentDB from './db.js';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { calcPriceCents, formatPrice, getPriceSchedule, PREMIUM_ROOTS } from './pricing.js';
import { mintRootNFT, getMintedCount } from './minter.js';

dotenv.config();

const app  = express();
const PORT = process.env.API_PORT || 9000;
const db   = new PaymentDB();

// ── Stripe ────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-04-10',
});
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.length === 0
      ? true
      : allowedOrigins.includes(origin) || origin.startsWith('http://localhost');
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));

// Raw body for Stripe webhook signature — before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────
const rateLimitMap = new Map();
function checkRateLimit(ip, limit = 20) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ─────────────────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'y3k-genesis-api',
    version: '3.0.0',
    features: ['bonding-curve', 'stripe', 'nft-mint'],
  });
});

// ─────────────────────────────────────────────────────────
// PRICING — bonding curve
// ─────────────────────────────────────────────────────────

app.get('/api/price/summary', async (req, res) => {
  try {
    const minted      = await getMintedCount();
    const schedule    = getPriceSchedule();
    const sampleCents = calcPriceCents(minted, 200);
    res.json({
      minted,
      remaining:         900 - minted,
      currentPriceUsd:   sampleCents / 100,
      currentPriceCents: sampleCents,
      premiumMultiplier: 3,
      premiumRoots:      [...PREMIUM_ROOTS],
      schedule,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/price/:root', async (req, res) => {
  try {
    const root = parseInt(req.params.root);
    if (isNaN(root) || root < 100 || root > 999) {
      return res.status(400).json({ error: 'Root must be 100-999' });
    }
    const minted    = await getMintedCount();
    const cents     = calcPriceCents(minted, root);
    const isPremium = PREMIUM_ROOTS.has(root);
    res.json({
      root,
      priceCents:        cents,
      priceUsd:          cents / 100,
      priceDisplay:      formatPrice(cents),
      isPremium,
      premiumMultiplier: isPremium ? 3 : 1,
      minted,
      remaining:         900 - minted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// STRIPE
// ─────────────────────────────────────────────────────────

// POST /api/stripe/create-intent
// Body: { root, walletAddress?, email? }
app.post('/api/stripe/create-intent', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

    const { root, walletAddress, email } = req.body;
    const num = parseInt(root);
    if (isNaN(num) || num < 100 || num > 999) {
      return res.status(400).json({ error: 'Root must be 100-999' });
    }

    const existing = db.getPaymentByRoot(num);
    if (existing && existing.status === 'confirmed') {
      return res.status(409).json({ error: `Root #${num} is already claimed.` });
    }

    const minted     = await getMintedCount();
    const priceCents = calcPriceCents(minted, num);

    const intentData = {
      amount:   priceCents,
      currency: 'usd',
      metadata: {
        root:          String(num),
        walletAddress: walletAddress || '',
        product:       'Y3K Genesis Root',
      },
      description:                  `Y3K Genesis Root #${num}`,
      statement_descriptor_suffix:  `ROOT ${num}`,
    };
    if (email) intentData.receipt_email = email;

    const intent = await stripe.paymentIntents.create(intentData);

    res.status(201).json({
      client_secret:       intent.client_secret,
      payment_intent_id:   intent.id,
      root:                num,
      price_cents:         priceCents,
      price_usd:           priceCents / 100,
      price_display:       formatPrice(priceCents),
      is_premium:          PREMIUM_ROOTS.has(num),
      publishable_key:     process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (err) {
    console.error('create-intent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stripe/intent/:id
app.get('/api/stripe/intent/:id', async (req, res) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({ id: intent.id, status: intent.status, root: intent.metadata?.root, amount: intent.amount });
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

// POST /api/stripe/webhook
app.post('/api/stripe/webhook', async (req, res) => {
  let event;
  try {
    if (STRIPE_WEBHOOK_SECRET && !STRIPE_WEBHOOK_SECRET.startsWith('whsec_placeholder')) {
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent        = event.data.object;
    const root          = parseInt(intent.metadata?.root);
    const walletAddress = intent.metadata?.walletAddress || '';

    if (!isNaN(root) && root >= 100 && root <= 999) {
      const paymentId = randomUUID();
      try {
        db.createPayment(paymentId, root, 'STRIPE', intent.amount / 100);
        db.confirmPayment(paymentId);
        console.log(`💳 Stripe confirmed: root #${root}`);

        // Mint NFT on Polygon (non-blocking)
        mintRootNFT(root, walletAddress, String(root), '')
          .then(result => {
            console.log(`⛓️  NFT minted root #${root} tx=${result.txHash}`);
            try { db.updateTransaction(paymentId, result.txHash, 1, 'complete'); } catch {}
          })
          .catch(err => console.error(`⚠️  Mint failed root #${root}:`, err.message));

      } catch (dbErr) {
        console.error('DB error:', dbErr.message);
      }
    }
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────
// LEGACY CRYPTO ROUTES
// ─────────────────────────────────────────────────────────

app.post('/api/payment/create', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

    const { root, asset } = req.body;
    const num = parseInt(root);
    if (isNaN(num) || num < 100 || num > 999) {
      return res.status(400).json({ error: 'Root must be 100-999' });
    }
    if (!['BTC', 'ETH', 'USDC', 'USDT'].includes(asset?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid asset.' });
    }

    const existing = db.getPaymentByRoot(num);
    if (existing) return res.status(409).json({ error: 'Root already claimed.' });

    const minted     = await getMintedCount();
    const priceCents = calcPriceCents(minted, num);

    const paymentId = randomUUID();
    const payment   = db.createPayment(paymentId, num, asset.toUpperCase(), priceCents / 100);

    res.status(201).json({
      payment_id:       payment.id,
      root:             payment.root,
      asset:            payment.asset,
      price_cents:      priceCents,
      price_usd:        priceCents / 100,
      price_display:    formatPrice(priceCents),
      wallet_addresses: {
        BTC:  process.env.WALLET_BTC,
        ETH:  process.env.WALLET_ETH,
        USDC: process.env.WALLET_ETH,
        USDT: process.env.WALLET_ETH,
      },
      created_at: payment.created_at,
      expires_at: payment.created_at + 86400,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/payment/status/:id', (req, res) => {
  try {
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });
    const payment = db.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Not found' });
    const now       = Math.floor(Date.now() / 1000);
    const expiresAt = payment.created_at + 86400;
    res.json({
      payment_id:   payment.id,
      root:         payment.root,
      asset:        payment.asset,
      status:       now > expiresAt && payment.status === 'pending' ? 'expired' : payment.status,
      tx_hash:      payment.tx_hash,
      confirmations: payment.confirmations,
      created_at:   payment.created_at,
      confirmed_at: payment.confirmed_at,
      expires_at:   expiresAt,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Y3K Genesis API v3 → http://localhost:${PORT}`);
  console.log(`   Pricing:  bonding curve ($9 base, +$1/10 mints)`);
  console.log(`   Stripe:   ${process.env.STRIPE_API_KEY?.startsWith('sk_live') ? '✅ LIVE' : '⚠️  test/not set'}`);
  console.log(`   NFT:      ${process.env.NUMBER_ROOT_NFT || '⚠️  deploy contract first'}`);
  console.log(`   Minter:   ${process.env.MINTER_PRIVATE_KEY ? '✅ set' : '⚠️  not set'}\n`);
});

process.on('SIGINT', () => { db.close(); process.exit(0); });

