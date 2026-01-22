'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface MintRootClientProps {
  root: string;
}

export default function MintRootClient({ root }: MintRootClientProps) {
  const [mounted, setMounted] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Calculate rarity
  const digits = root.split('');
  let rarity = 'STANDARD';
  let rarityColor = '#888';
  let rarityEmoji = '⚡';
  
  if (digits[0] === digits[1] && digits[1] === digits[2]) {
    rarity = 'CROWN';
    rarityColor = '#FFD700';
    rarityEmoji = '👑';
  } else if (digits[0] === digits[1] || digits[1] === digits[2]) {
    rarity = 'MYTHIC';
    rarityColor = '#9C27B0';
    rarityEmoji = '💎';
  }
  
  const mintUrl = mounted ? window.location.href : '';
  
  const handleMint = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9000/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootNumber: parseInt(root),
          asset: 'BTC'
        })
      });
      
      if (!response.ok) throw new Error('Failed to create payment');
      
      const data = await response.json();
      setPaymentIntent(data);
    } catch (error) {
      console.error('Mint error:', error);
      alert('Failed to start minting. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const copyMintLink = () => {
    navigator.clipboard.writeText(mintUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Rarity Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" 
               style={{ backgroundColor: `${rarityColor}22`, border: `1px solid ${rarityColor}` }}>
            <span className="text-2xl">{rarityEmoji}</span>
            <span className="font-mono text-sm" style={{ color: rarityColor }}>
              {rarity} TIER
            </span>
          </div>
          
          {/* Root Number */}
          <h1 className="text-7xl font-bold mb-4 font-mono tracking-tight">
            {root}<span className="text-gray-600">.y3k</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8">
            Genesis Root • Supply: 1 of 1 • $29 USD
          </p>
          
          {/* QR Code */}
          <div className="bg-white p-8 rounded-2xl inline-block mb-8">
            <QRCodeSVG 
              value={mintUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <p className="text-sm text-gray-500 mb-8">
            Scan to share • Each root is unique forever
          </p>
        </div>
        
        {/* Mint Section */}
        <div className="max-w-md mx-auto">
          {!paymentIntent ? (
            <div className="space-y-4">
              <button
                onClick={handleMint}
                disabled={loading}
                className="w-full bg-white text-black py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Starting Mint...' : '🎁 MINT NOW'}
              </button>
              
              <button
                onClick={copyMintLink}
                className="w-full bg-transparent border border-gray-700 text-gray-300 py-3 px-6 rounded-xl hover:bg-gray-900 transition-colors"
              >
                {copied ? '✓ Link Copied!' : '📋 Copy Mint Link'}
              </button>
              
              {/* Share Info */}
              <div className="mt-8 p-6 bg-gray-900 rounded-xl">
                <h3 className="font-bold mb-2 text-sm text-gray-400">🚀 SHARE THIS LINK</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Send this unique URL to friends, post it on social media, or airdrop it to your community
                </p>
                <code className="text-xs text-green-400 break-all block bg-black p-3 rounded">
                  {mintUrl}
                </code>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">💳 Payment Ready</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-mono">{paymentIntent.amount} {paymentIntent.asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <code className="font-mono text-xs">{paymentIntent.address?.substring(0, 20)}...</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires:</span>
                  <span>{new Date(paymentIntent.expiresAt).toLocaleTimeString()}</span>
                </div>
              </div>
              
              {/* Payment QR */}
              <div className="mt-6 bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG 
                  value={`bitcoin:${paymentIntent.address}?amount=${paymentIntent.amount}`}
                  size={150}
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Send payment to complete mint • Checking blockchain...
              </p>
            </div>
          )}
        </div>
        
        {/* Features */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold text-sm mb-1">Immutable</h3>
            <p className="text-xs text-gray-500">Never duplicated</p>
          </div>
          <div>
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-sm mb-1">Instant</h3>
            <p className="text-xs text-gray-500">Mints on payment</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-bold text-sm mb-1">Universal</h3>
            <p className="text-xs text-gray-500">Works everywhere</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-900 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            Powered by Y3K Protocol • Genesis Event 2026
          </p>
        </div>
      </div>
    </div>
  );
}
