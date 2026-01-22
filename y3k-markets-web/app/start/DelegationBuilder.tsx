"use client";

import { useState } from "react";
import * as ed from "@noble/ed25519";

// Hex helpers
const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const fromHex = (hex: string) =>
  new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

export default function DelegationBuilder() {
  const [step, setStep] = useState<"draft" | "review" | "sign">("draft");
  const [formData, setFormData] = useState({
    parent: "",
    scope: [] as string[],
    expiryDays: 30,
    delegatePubkey: "",
    generatedDelegate: null as { priv: string; pub: string } | null,
  });
  const [jsonPayload, setJsonPayload] = useState<string>("");
  const [signedArtifact, setSignedArtifact] = useState<string>("");
  const [rootKeyInput, setRootKeyInput] = useState("");
  const [signError, setSignError] = useState("");

  const SCOPE_OPTIONS = ["VOTE", "SIGN", "CHAT", "TRANSFERS_LIMITED", "ADMIN"];

  const handleScopeToggle = (s: string) => {
    setFormData(prev => ({
        ...prev,
        scope: prev.scope.includes(s) 
            ? prev.scope.filter(i => i !== s)
            : [...prev.scope, s]
    }));
  };

  const generateNewDelegate = async () => {
    const priv = ed.utils.randomSecretKey();
    const pub = await ed.getPublicKey(priv);
    const pubHex = toHex(pub);
    const privHex = toHex(priv);
    setFormData(prev => ({
        ...prev,
        delegatePubkey: pubHex,
        generatedDelegate: { priv: privHex, pub: pubHex }
    }));
  };

  const buildPayload = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + formData.expiryDays);

    const payload = {
        type: "DELEGATION",
        parent: formData.parent.toLowerCase(), // Enforce normalization
        delegate_pubkey: formData.delegatePubkey,
        scope: formData.scope,
        expiry: expiryDate.toISOString(),
    };

    setJsonPayload(JSON.stringify(payload, null, 2));
    setStep("review");
  };

  const handleSign = async () => {
    try {
        setSignError("");
        const privBytes = fromHex(rootKeyInput);
        const pubBytes = await ed.getPublicKey(privBytes);
        const pubHex = toHex(pubBytes);
        
        // Sanity Check: Does the private key match the 'parent' implied? 
        // In a real app we'd fetch the parent's pubkey from IPFS to compare, 
        // but here we just trust the user holds the key for the name they typed.
        
        const rawPayload = JSON.parse(jsonPayload);
        
        // Standardized Signing Message Construction
        // ${parent}:${delegate}:${expiry}:${scope}:${type}
        const messageString = `${rawPayload.parent}:${rawPayload.delegate_pubkey}:${rawPayload.expiry}:${rawPayload.scope.join(',')}:${rawPayload.type}`;
        const messageBytes = new TextEncoder().encode(messageString);
        
        const signature = await ed.sign(messageBytes, privBytes);
        
        const finalArtifact = {
            ...rawPayload,
            signature: toHex(signature)
        };

        setSignedArtifact(JSON.stringify(finalArtifact, null, 2));
        setStep("sign"); // Complete
    } catch (e: any) {
        setSignError("Invalid Private Key or Signing Failed.");
        console.error(e);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">⚡</span> Delegation Builder
        </h3>
        <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${step === 'draft' ? 'bg-purple-900 text-white' : 'text-gray-600'}`}>1. Draft</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${step === 'review' ? 'bg-purple-900 text-white' : 'text-gray-600'}`}>2. Review</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${step === 'sign' ? 'bg-green-900 text-white' : 'text-gray-600'}`}>3. Sign</span>
        </div>
      </div>

      <div className="p-6">
        
        {/* STEP 1: DRAFT */}
        {step === "draft" && (
            <div className="space-y-6">
                {/* Parent Identity */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Authority (Parent)</label>
                    <input 
                        type="text" 
                        value={formData.parent}
                        onChange={(e) => setFormData({...formData, parent: e.target.value})}
                        placeholder="e.g. kevan.x"
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-purple-500 transition font-mono"
                    />
                </div>

                {/* Delegate Key */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <label className="block text-sm font-bold text-gray-400 mb-2">Delegate Public Key</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text"
                            value={formData.delegatePubkey}
                            onChange={(e) => setFormData({...formData, delegatePubkey: e.target.value})}
                            placeholder="ed25519 public key hex..."
                            className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white text-xs font-mono"
                        />
                        <button 
                            onClick={generateNewDelegate}
                            className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800 text-white text-xs font-bold rounded-lg border border-purple-500/30 transition"
                        >
                            Generate New
                        </button>
                    </div>
                    {formData.generatedDelegate && (
                        <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs">
                            <strong className="text-red-400 block mb-1">SAVE THIS NEW KEYPAIR:</strong>
                            <div className="grid grid-cols-[40px_1fr] gap-2 font-mono text-gray-300">
                                <span>PUB:</span> <span className="break-all">{formData.generatedDelegate.pub}</span>
                                <span>PVT:</span> <span className="break-all text-red-300">{formData.generatedDelegate.priv}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scope */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Permissions (Scope)</label>
                    <div className="flex flex-wrap gap-2">
                        {SCOPE_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => handleScopeToggle(opt)}
                                className={`px-3 py-2 rounded text-xs font-bold border transition ${
                                    formData.scope.includes(opt) 
                                        ? 'bg-blue-900 text-white border-blue-500' 
                                        : 'bg-black text-gray-500 border-white/10 hover:border-white/30'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expiry */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Duration (Days)</label>
                    <input 
                        type="range" 
                        min="1" max="365" 
                        value={formData.expiryDays}
                        onChange={(e) => setFormData({...formData, expiryDays: parseInt(e.target.value)})}
                        className="w-full accent-purple-500"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">{formData.expiryDays} Days</div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={buildPayload}
                        disabled={!formData.parent || !formData.delegatePubkey || formData.scope.length === 0}
                        className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 transition"
                    >
                        Review Payload →
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: REVIEW */}
        {step === "review" && (
            <div className="space-y-6">
                <div className="p-4 bg-black/50 border border-white/10 rounded-lg">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
                        {jsonPayload}
                    </pre>
                </div>
                
                <div className="bg-yellow-900/10 border border-yellow-500/30 p-4 rounded-lg">
                    <h4 className="text-yellow-500 font-bold mb-2">⚠ Signing Required</h4>
                    <p className="text-sm text-gray-400 mb-4">
                        To activate this delegation, it must be signed by the <strong>Root Key</strong> of <code>{formData.parent}</code>.
                    </p>
                    
                    <div className="space-y-4">
                        <textarea
                            value={rootKeyInput}
                            onChange={(e) => setRootKeyInput(e.target.value)}
                            placeholder="Paste Root Private Key (Hex) to Sign..."
                            className="w-full p-3 bg-black border border-white/10 rounded text-xs text-white font-mono focus:border-yellow-500 outline-none"
                        />
                        {signError && <div className="text-red-500 text-xs font-bold">{signError}</div>}
                        
                        <div className="flex gap-4">
                             <button
                                onClick={() => setStep('draft')}
                                className="flex-1 py-3 bg-gray-800 text-white rounded font-bold hover:bg-gray-700"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSign}
                                disabled={!rootKeyInput}
                                className="flex-1 py-3 bg-yellow-600 text-black font-bold rounded hover:bg-yellow-500 disabled:opacity-50"
                            >
                                Sign Artifact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "sign" && (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500 text-black text-3xl font-bold rounded-full flex items-center justify-center mx-auto">
                    ✓
                </div>
                <h3 className="text-2xl font-bold text-white">Delegation Active</h3>
                <p className="text-gray-400">Your specific authority has been crystallized.</p>
                
                <div className="p-4 bg-black/50 border border-green-500/30 rounded-lg text-left">
                    <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-all">
                        {signedArtifact}
                    </pre>
                </div>

                <button
                    onClick={() => {navigator.clipboard.writeText(signedArtifact); alert("Copied!");}}
                    className="w-full py-3 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition"
                >
                    Copy JSON Artifact
                </button>
            </div>
        )}

      </div>
    </div>
  );
}
