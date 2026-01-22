"use client";

import { useState, useEffect } from "react";

interface NamespaceQR {
  name: string;
  token: string;
  url: string;
  qrCode: string | null;
}

const NAMESPACES: Omit<NamespaceQR, 'qrCode'>[] = [
  { name: "brad.x (Personal)", token: "brad", url: "" },
  { name: "45.x (Protocol Authority)", token: "brad45", url: "" },
  { name: "77.x (Partner Don)", token: "77-2026-01-17-z7a2c8d1e5b4928f5ae2d3b4c6a7z8d1", url: "" },
  { name: "88.x (Double Infinity)", token: "88", url: "" },
  { name: "222.x (Triple Balance)", token: "222", url: "" },
  { name: "333.x (Triple Growth)", token: "333", url: "" },
  { name: "trump.x (Crown Reserve)", token: "trump", url: "" },
  { name: "don.x (Alternative)", token: "don", url: "" },
  { name: "rogue.x (Shadow Ops)", token: "rogue", url: "" },
  { name: "buck.x (Genesis Founder)", token: "buck", url: "" },
  { name: "jimi.x (Genesis Founder)", token: "jimi", url: "" },
  { name: "ben.x (Genesis Founder)", token: "ben", url: "" },
];

export default function QRAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [qrCodes, setQrCodes] = useState<NamespaceQR[]>([]);
  const [loading, setLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = passkey.toLowerCase().trim();
    if (cleanKey === "kevan" || cleanKey === "77" || cleanKey === "admin") {
      setIsAuthenticated(true);
    }
  };

  const generateAllQRCodes = async () => {
    setLoading(true);
    const updated: NamespaceQR[] = [];

    for (const ns of NAMESPACES) {
      const claimUrl = `${baseUrl}/claim?token=${ns.token}`;
      
      try {
        const res = await fetch('/api/claim/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: claimUrl })
        });

        const data = await res.json();
        
        updated.push({
          ...ns,
          url: claimUrl,
          qrCode: data.qrCode || null
        });
      } catch (err) {
        updated.push({
          ...ns,
          url: claimUrl,
          qrCode: null
        });
      }
    }

    setQrCodes(updated);
    setLoading(false);
  };

  const downloadQR = (namespace: string, qrDataUrl: string) => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${namespace.replace('.x', '')}-claim-qr.png`;
    link.click();
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-cyan-400 font-mono p-10 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-8 tracking-widest animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          QR // GENERATOR
        </h1>
        <div className="w-full max-w-md bg-gray-900/40 border border-cyan-900/50 p-8 backdrop-blur-sm">
          <p className="text-xs text-cyan-700 mb-4 text-center">SECURE ACCESS REQUIRED</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="ENTER KEY" 
              className="bg-black border-2 border-cyan-900 text-center p-4 text-xl text-cyan-100 focus:border-cyan-400 outline-none transition-all"
              autoFocus
            />
            <button type="submit" className="bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-400 border border-cyan-800 p-4 transition uppercase tracking-widest text-sm font-bold">
              Authenticate
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-800 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            QR CODE GENERATOR
          </h1>
          <p className="text-gray-500 text-sm">Generate claiming QR codes for all sovereign namespaces</p>
        </div>

        {/* Generate Button */}
        <div className="mb-12">
          <button 
            onClick={generateAllQRCodes}
            disabled={loading}
            className="bg-cyan-900/40 hover:bg-cyan-800/60 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 border border-cyan-800 px-8 py-4 transition uppercase tracking-widest text-sm font-bold"
          >
            {loading ? 'GENERATING...' : 'GENERATE ALL QR CODES'}
          </button>
        </div>

        {/* QR Code Grid */}
        {qrCodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {qrCodes.map((ns, idx) => (
              <div key={idx} className="bg-gray-900/40 border border-gray-800 p-6 flex flex-col">
                {/* Namespace Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-cyan-400 mb-1">{ns.name}</h3>
                  <p className="text-xs text-gray-500 font-mono break-all">Token: {ns.token}</p>
                </div>

                {/* QR Code Display */}
                {ns.qrCode && (
                  <div className="bg-black p-4 mb-4 flex items-center justify-center border border-gray-800">
                    <img src={ns.qrCode} alt={ns.name} className="w-64 h-64" />
                  </div>
                )}

                {/* URL Display */}
                <div className="mb-4 bg-black border border-gray-800 p-3">
                  <p className="text-xs text-gray-500 mb-1">Claim URL:</p>
                  <p className="text-xs text-cyan-400 break-all font-mono">{ns.url}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  {ns.qrCode && (
                    <button 
                      onClick={() => downloadQR(ns.name, ns.qrCode!)}
                      className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-900/50 px-4 py-2 transition text-xs uppercase tracking-wider"
                    >
                      Download QR
                    </button>
                  )}
                  <button 
                    onClick={() => copyUrl(ns.url)}
                    className={`flex-1 px-4 py-2 transition text-xs uppercase tracking-wider ${
                      copiedUrl === ns.url 
                        ? 'bg-green-900/40 text-green-400 border border-green-500' 
                        : 'bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50'
                    }`}
                  >
                    {copiedUrl === ns.url ? '✓ Copied!' : 'Copy URL'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-gray-900/20 border border-gray-800 p-6">
          <h3 className="text-lg text-cyan-400 mb-4">📋 USAGE INSTRUCTIONS</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-cyan-600">1.</span>
              <span>Click "GENERATE ALL QR CODES" to create claiming QR codes for all namespaces</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">2.</span>
              <span>Download QR codes as PNG files for printing or digital distribution</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">3.</span>
              <span>Copy claim URLs for SMS transmission via the main hub</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">4.</span>
              <span><strong>Important:</strong> Each person scans their QR and generates their own Ed25519 keys client-side</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">5.</span>
              <span>The claiming ceremony ensures true sovereignty - they sign their own certificates</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
