"use client";

import { useState } from "react";
import * as ed from "@noble/ed25519";

const IPFS_BASE_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e";
const IPFS_GATEWAY = "https://cloudflare-ipfs.com/ipfs";

// Hex helper
const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const fromHex = (hex: string) =>
  new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

export default function DelegationVerifier() {
  const [jsonInput, setJsonInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sigStatus, setSigStatus] = useState<"unchecked" | "fetching" | "valid" | "invalid" | "error">("unchecked");
  const [rootKeyFetched, setRootKeyFetched] = useState<string | null>(null);

  const handleVerify = async () => {
    setResult(null);
    setSigStatus("unchecked");
    setRootKeyFetched(null);
    setIsVerifying(true);

    try {
      // 1. Structural Validation (Schema Check)
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error("Invalid JSON format. Please check your syntax.");
      }

      const requiredFields = ["type", "parent", "delegate_pubkey", "scope", "expiry", "signature"];
      const missing = requiredFields.filter((field) => !parsed[field]);
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(", ")}`);
      }

      if (parsed.type !== "DELEGATION") {
        throw new Error("Invalid Type: Must be 'DELEGATION'");
      }

      if (!Array.isArray(parsed.scope)) {
        throw new Error("Invalid Scope: Must be an array of permission strings");
      }

      // 2. Expiry Check
      const expiryDate = new Date(parsed.expiry);
      if (isNaN(expiryDate.getTime())) {
        throw new Error("Invalid Expiry: Must be a valid ISO date string");
      }
      const now = new Date();
      const isExpired = expiryDate < now;
      const timeLeft = expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

      const validationResult = {
        isValidSchema: true,
        parent: parsed.parent,
        delegate: parsed.delegate_pubkey,
        scope: parsed.scope.join(", "),
        expiryStatus: isExpired ? "EXPIRED" : `Active (${daysLeft} days remaining)`,
        signature: parsed.signature,
      };

      setResult(validationResult);

      // 3. Cryptographic Verification (Optional but Critical)
      if (parsed.signature) {
        await verifySignature(parsed);
      }

    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifySignature = async (payload: any) => {
    setSigStatus("fetching");
    try {
      // A. Fetch Root Key from IPFS
      // Logic borrowed from SovereignTools.tsx
      const rawName = payload.parent.toLowerCase().replace(/\.x$/, "");
      const fileName = `${rawName}.x.json`;
      const url = `${IPFS_GATEWAY}/${IPFS_BASE_CID}/${fileName}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Root identity '${payload.parent}' not found on IPFS (Status ${res.status})`);
      }

      const rootData = await res.json();
      
      // Assume 'public_key' or 'owner_key' is present in the root record
      // Based on typical ed25519 hex string format
      const rootPubkey = rootData.public_key || rootData.owner_key; 
      
      if (!rootPubkey) {
        throw new Error("Root record found, but contains no public key.");
      }
      
      setRootKeyFetched(rootPubkey);

      // B. Verify
      // Construct the message. Standard: Deterministic string of critical fields.
      // NOTE: This must match the future Generator implementation.
      // Format: `${parent}:${delegate}:${expiry}:${scope}:${type}`
      // This is a robust simple serialization for signing.
      const messageString = `${payload.parent}:${payload.delegate_pubkey}:${payload.expiry}:${payload.scope.join(',')}:${payload.type}`;
      const messageBytes = new TextEncoder().encode(messageString);
      const signatureBytes = fromHex(payload.signature);
      const pubKeyBytes = fromHex(rootPubkey);

      const isValid = await ed.verify(signatureBytes, messageBytes, pubKeyBytes);

      setSigStatus(isValid ? "valid" : "invalid");

    } catch (err: any) {
      console.warn("Signature verification failed:", err);
      setSigStatus("error");
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden mt-8">
      <div className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">🛡️</span> Delegation Verifier
        </h3>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Read Only</span>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Paste Delegation Artifact (JSON)</label>
            <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "type": "DELEGATION", "parent": "kevan.x", ... }'
                className="w-full h-64 bg-black/50 border border-white/20 rounded-lg p-4 font-mono text-xs text-gray-300 focus:outline-none focus:border-blue-500 transition resize-none"
            />
            <button
                onClick={handleVerify}
                disabled={isVerifying || !jsonInput}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
                {isVerifying ? "Analyzing..." : "Verify Authority"}
            </button>
        </div>

        {/* Results Column */}
        <div className="bg-black/20 rounded-lg p-6 border border-white/5 relative">
            {!result ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm font-mono">
                    Waiting for input...
                </div>
            ) : result.error ? (
                <div className="text-red-400 font-mono text-sm">
                    <strong>Error:</strong> {result.error}
                </div>
            ) : (
                <div className="space-y-6 font-mono text-sm">
                    {/* Status Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className={`w-3 h-3 rounded-full ${result.expiryStatus === 'EXPIRED' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-white font-bold tracking-wider">
                            {result.expiryStatus === 'EXPIRED' ? 'INVALID (EXPIRED)' : 'SCHEMA VALID'}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-gray-500 block text-xs mb-1">Root Authority (Parent)</span>
                            <span className="text-blue-300 block break-all">{result.parent}</span>
                        </div>

                        <div>
                            <span className="text-gray-500 block text-xs mb-1">Delegate Key</span>
                            <span className="text-purple-300 block break-all text-xs">{result.delegate}</span>
                        </div>

                        <div>
                            <span className="text-gray-500 block text-xs mb-1">Permissions (Scope)</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {result.scope.split(', ').map((s: string) => (
                                    <span key={s} className="px-2 py-1 bg-white/10 rounded text-xs text-white border border-white/10">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-gray-500 block text-xs mb-1">Expiration</span>
                            <span className={result.expiryStatus.includes('Active') ? 'text-green-400' : 'text-red-400'}>
                                {result.expiryStatus}
                            </span>
                        </div>
                    </div>

                    {/* Signature Status */}
                    <div className="pt-4 border-t border-white/10">
                        <span className="text-gray-500 block text-xs mb-2">Cryptographic Proof (Root Signature)</span>
                        <div className="flex items-center gap-3">
                             {sigStatus === 'fetching' && <span className="text-yellow-500 animate-pulse">Fetching Root Key from IPFS...</span>}
                             {sigStatus === 'valid' && <span className="text-green-500 font-bold flex items-center gap-2">✓ VERIFIED via IPFS</span>}
                             {sigStatus === 'invalid' && <span className="text-red-500 font-bold">✗ INVALID SIGNATURE</span>}
                             {sigStatus === 'error' && <span className="text-orange-500">⚠ Unverifiable (Root not found/Network error)</span>}
                        </div>
                        {rootKeyFetched && (
                            <div className="mt-2 text-xs text-gray-600 truncate">
                                Verified against: {rootKeyFetched}
                            </div>
                        )}
                        {sigStatus === 'invalid' && (
                             <p className="text-xs text-red-900 mt-2">
                                 The signature does not match the content + root key.
                             </p>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
