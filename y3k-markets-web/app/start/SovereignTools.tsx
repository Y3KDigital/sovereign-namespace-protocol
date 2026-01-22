"use client";

import { useState, useCallback } from "react";
import * as ed from "@noble/ed25519";

// Ensure sha512 is available for ed25519 in browser environment
// @ts-ignore
if (typeof window !== "undefined" && !window.crypto?.subtle) {
  console.warn("WebCrypto not supported in this browser context.");
}

const IPFS_BASE_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e";
const IPFS_GATEWAY = "https://cloudflare-ipfs.com/ipfs";

export default function SovereignTools() {
  const [activeTab, setActiveTab] = useState<"network" | "crypto">("network");

  return (
    <div className="w-full max-w-4xl mx-auto bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/10 mb-16">
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("network")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "network"
              ? "bg-white/10 text-white border-b-2 border-purple-500"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          Network Check (IPFS)
        </button>
        <button
          onClick={() => setActiveTab("crypto")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "crypto"
              ? "bg-white/10 text-white border-b-2 border-green-500"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          Signature Verify (Ed25519)
        </button>
      </div>

      <div className="p-6 md:p-8 bg-black/50 backdrop-blur-sm min-h-[400px]">
        {activeTab === "network" ? <NetworkVerifier /> : <CryptoVerifier />}
      </div>
    </div>
  );
}

function NetworkVerifier() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async () => {
    if (!input) return;
    setStatus("loading");
    setErrorMsg("");
    setData(null);

    // Clean input (remove .x optional)
    const rawName = input.toLowerCase().replace(/\.x$/, "");
    const fileName = `${rawName}.x.json`; // Files are stored as "name.x.json" in the CID folder

    try {
      const url = `${IPFS_GATEWAY}/${IPFS_BASE_CID}/${fileName}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Namespace not found in Genesis Block (${res.status})`);
      }

      const json = await res.json();
      setData(json);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Verification failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Protocol Verification</h3>
        <p className="text-gray-400 text-sm">
          Query the immutable IPFS record directly. This bypasses Y3K servers and checks the global file system.
        </p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="e.g. 100 or kevan"
          className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition font-mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        />
        <button
          onClick={handleVerify}
          disabled={status === "loading" || !input}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition"
        >
          {status === "loading" ? "Querying..." : "Verify on IPFS"}
        </button>
      </div>

      {status === "success" && data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-bold tracking-wide">GENESIS ROOT VERIFIED</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
              <div className="p-3 bg-black/40 rounded border border-white/5">
                <div className="text-gray-500 text-xs uppercase mb-1">Namespace</div>
                <div className="text-white">{data.name || input}</div>
              </div>
              <div className="p-3 bg-black/40 rounded border border-white/5">
                <div className="text-gray-500 text-xs uppercase mb-1">Rarity Rank</div>
                <div className="text-purple-400">#{data.rank || "Unknown"}</div>
              </div>
              <div className="col-span-1 md:col-span-2 p-3 bg-black/40 rounded border border-white/5 overflow-hidden">
                 <div className="text-gray-500 text-xs uppercase mb-1">Genesis Certificate Hash</div>
                 <div className="text-gray-300 break-all">{data.cert_hash || "Available in full validation"}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500 flex justify-between">
              <span>Source: IPFS (Cloudflare Gateway)</span>
              <span>CID: ...{IPFS_BASE_CID.slice(-8)}</span>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-mono">
          ERROR: {errorMsg}
        </div>
      )}
    </div>
  );
}

function CryptoVerifier() {
  const [step, setStep] = useState(1); // 1: Explain, 2: Interactive
  const [pubKey, setPubKey] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleCheck = async () => {
    try {
      if (!pubKey || !message || !signature) return;
      const msgBytes = new TextEncoder().encode(message);
      // Clean hex input
      const pubBytes = hexToBytes(pubKey);
      const sigBytes = hexToBytes(signature);
      
      const valid = await ed.verifyAsync(sigBytes, msgBytes, pubBytes);
      setIsValid(valid);
    } catch (e) {
      console.error(e);
      setIsValid(false);
    }
  };

  const loadExample = () => {
    // Example Ed25519 pair
    // Priv: (Hidden)
    // Pub: c47508676d183864006f15715697672224d065842188049257e85c13e4f73809
    // Msg: "I control the root 100.x"
    // Sig: See below
    setPubKey("c47508676d183864006f15715697672224d065842188049257e85c13e4f73809");
    setMessage("I control the root 100.x");
    setSignature("42d87e07471939115c54c33c2742968396c21e649032549d4432174c8b2518e388147d3d3a042e6129d242767078393e10fa4e672776c53574d6880860534208");
    setIsValid(null);
  };

  return (
    <div className="space-y-6">
       <div>
        <h3 className="text-xl font-bold text-white mb-2">Cryptographic Proof</h3>
        <p className="text-gray-400 text-sm">
          Verify a digital signature. This proves that the message was signed by the owner of the Private Key, without revealing the Private Key itself.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500 font-bold">Message (Plaintext)</label>
            <input 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded p-3 text-white font-mono text-sm"
                placeholder="The text that was signed"
            />
        </div>

        <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500 font-bold">Public Key (Hex)</label>
            <input 
                value={pubKey}
                onChange={e => setPubKey(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded p-3 text-green-400 font-mono text-sm"
                placeholder="The identity of the signer"
            />
        </div>

        <div className="space-y-2">
            <label className="text-xs uppercase text-gray-500 font-bold">Signature (Hex)</label>
            <textarea 
                value={signature}
                onChange={e => setSignature(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded p-3 text-blue-400 font-mono text-xs h-24"
                placeholder="The cryptographic proof"
            />
        </div>

        <div className="flex gap-4 pt-4">
            <button 
                onClick={handleCheck}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
            >
                Verify Signature
            </button>
            <button 
                onClick={loadExample}
                className="px-6 py-3 border border-white/10 text-gray-400 hover:text-white rounded-lg transition text-sm"
            >
                Load Example
            </button>
        </div>

        {isValid === true && (
             <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400 text-center font-bold animate-in fade-in zoom-in-95">
                ✓ VALID SIGNATURE (Authentic)
             </div>
        )}
        {isValid === false && (
             <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-center font-bold animate-in fade-in zoom-in-95">
                ⚠ INVALID SIGNATURE (Forgery or Tampered)
             </div>
        )}

      </div>
    </div>
  );
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const hexByte = hex.substr(i * 2, 2);
    bytes[i] = parseInt(hexByte, 16);
  }
  return bytes;
}
