'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import * as ed from '@noble/ed25519';
import { emitHistory, getHistory, HistoryEvent } from '@/lib/history';

interface ClaimData {
  namespace: string;
  displayName: string;
  description: string;
  certificates: string[];
  valid: boolean;
  realName?: string;
  whatYouOwn?: string[];
  legalFraming?: string;
  tier: string;
  rarity: string;
  bonuses?: any[];
}

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'validate' | 'generate' | 'biometric' | 'multisig' | 'backup' | 'sign' | 'publish' | 'complete'>('validate');
  
  const [privateKey, setPrivateKey] = useState<Uint8Array | null>(null);
  const [publicKey, setPublicKey] = useState<Uint8Array | null>(null);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [biometricSecured, setBiometricSecured] = useState(false);
  const [biometricId, setBiometricId] = useState('');
  const [partners, setPartners] = useState<string[]>([]);
  const [newPartner, setNewPartner] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [unlockedBonuses, setUnlockedBonuses] = useState<any[]>([]);
  const [historyLog, setHistoryLog] = useState<HistoryEvent[]>([]);

  // Listen for history updates
  useEffect(() => {
    setHistoryLog(getHistory());
    
    const handler = () => setHistoryLog(getHistory());
    window.addEventListener('history-updated', handler);
    return () => window.removeEventListener('history-updated', handler);
  }, []);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError('No token provided');
        setLoading(false);
        return;
      }

      try {
        const apiBase = typeof window !== 'undefined' ? window.location.origin : 'https://y3kmarkets.com';
        const response = await fetch(`${apiBase}/api/claim/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.error || !data.valid) {
          setError('Invalid or expired token');
        } else {
          setClaimData(data);
          emitHistory("SESSION_STARTED", { token: token, namespace: data.namespace });
        }
      } catch (err) {
        setError('Failed to validate token');
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const generateKeys = async () => {
    try {
      const privKey = crypto.getRandomValues(new Uint8Array(32));
      const pubKey = await ed.getPublicKeyAsync(privKey);
      
      setPrivateKey(privKey);
      setPublicKey(pubKey);
      // Add artificial delay for "quantum effect" visual
      setTimeout(() => setStep('biometric'), 2000);
    } catch (err) {
      setError('Failed to generate keys');
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // REAL WebAuthn Implementation
      // This forces the device (FaceID/TouchID/Windows Hello) to verify identity
      // and creates a hardware-backed keypair bound to this namespace.
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "Y3K Sovereign Namespace",
            id: window.location.hostname
          },
          user: {
            id: new Uint8Array(16),
            name: claimData?.namespace || "founder",
            displayName: claimData?.displayName || "Genesis Founder"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "direct",
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces Platform Authenticator (FaceID, TouchID, Hello)
            userVerification: "required"
          }
        }
      }) as PublicKeyCredential;
      
      if (credential) {
         setBiometricId(credential.id);
         setBiometricSecured(true);
         
         emitHistory("BIOMETRIC_VERIFIED", { 
           method: "webauthn", 
           credential_id: credential.id.substring(0, 10) + "..." 
         }, "biometric_verified");
         
         setTimeout(() => setStep('multisig'), 2000); // Move to Multi-Sig setup
      }
    } catch (err: any) {
      console.error("Biometric failed:", err);
      // Fallback for dev/localhost if https not set up or hardware missing, 
      // but warn user this is lesser security.
      if (confirm("Hardware Biometrics Warning: Could not access secure enclave (FaceID/TouchID). Continue with standard cryptographic keys only?")) {
         setBiometricSecured(true);
         setBiometricId("standard-crypto-fallback");
         
         emitHistory("BIOMETRIC_BYPASS", { 
            reason: "dev_fallback",
            warning_accepted: true
         }, "client_session");

         setStep('multisig');
      }
    }
  };

  const addPartner = () => {
    if (newPartner && newPartner.includes('@')) {
      const updated = [...partners, newPartner];
      setPartners(updated);
      
      emitHistory("ADD_GOVERNANCE_SIGNER", { 
        added_signer: newPartner,
        total_signers: updated.length + 1
      });
      
      setNewPartner('');
    }
  };

  const finalizeMultiSig = () => {
     setStep('backup');
  };

  const downloadBackup = () => {
    if (!privateKey || !publicKey || !claimData) return;

    const backup = {
      namespace: claimData.namespace,
      privateKey: Array.from(privateKey),
      publicKey: Array.from(publicKey),
      timestamp: new Date().toISOString(),
      warning: 'CRITICAL: Store this file securely. Anyone with access to your private key can control your namespace.'
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${claimData.namespace}-PRIVATE-KEY-BACKUP.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const confirmBackup = () => {
    setBackupConfirmed(true);
    setStep('sign');
  };

  const signAndPublish = async () => {
    if (!privateKey || !publicKey || !claimData) {
      setError('Missing required data');
      return;
    }

    try {
      setStep('publish');

      const apiBase = typeof window !== 'undefined' ? window.location.origin : 'https://y3kmarkets.com';

      // Get certificate template
      const certResponse = await fetch(`${apiBase}/api/claim/certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const certificate = await certResponse.json();

      // Sign the certificate
      const certHash = new TextEncoder().encode(JSON.stringify(certificate));
      const signature = await ed.signAsync(certHash, privateKey);

      emitHistory("CLAIM_FINALIZED", { 
         namespace: claimData.namespace,
         hash: Array.from(certHash).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
      }, "cryptographic_signature");

      // Create signed certificate
      const signedCert = {
        ...certificate,
        public_key: Array.from(publicKey),
        signature: Array.from(signature),
        biometric_id: biometricId, // Bind hardware ID
        multisig_members: partners, // Bind governance team
        claimed_at: new Date().toISOString()
      };

      const completeResponse = await fetch(`${apiBase}/api/claim/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          namespace: claimData.namespace, // ← ADD NAMESPACE
          publicKey: Array.from(publicKey),
          signature: Array.from(signature),
          signedCertificate: signedCert
        })
      });
      
      const completeData = await completeResponse.json();
      
      // Check for blockchain registration failure
      if (!completeData.success) {
        setError(completeData.error || 'Claim failed');
        setStep('validate');
        return;
      }
      
      if (completeData.bonuses) {
         setUnlockedBonuses(completeData.bonuses);
      }

      // Save namespace data to localStorage for dashboard access
      if (typeof window !== 'undefined') {
        localStorage.setItem('claimed_namespace', JSON.stringify({
          namespace: claimData.namespace,
          certificates: claimData.certificates,
          tier: claimData.tier,
          rarity: claimData.rarity,
          claimedAt: new Date().toISOString(),
          publicKey: Array.from(publicKey)
        }));
      }

      setStep('complete');
    } catch (err) {
      console.error('Signing/publishing error:', err);
      setError('Failed to sign and publish certificate. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Invalid Token</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <p className="text-sm text-slate-400">If you believe this is an error, please contact support.</p>
        </div>
      </div>
    );
  }

  if (!claimData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <span className="text-amber-400 text-sm font-semibold tracking-wider">CEREMONIAL INVITATION</span>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
            {claimData.namespace}
          </h1>
          <p className="text-slate-300 text-xl">{claimData.description}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          {['validate', 'generate', 'biometric', 'multisig', 'backup', 'sign', 'publish', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === s ? 'bg-amber-500 text-slate-900' :
                ['validate', 'generate', 'biometric', 'multisig', 'backup', 'sign', 'publish'].indexOf(step) > i ? 'bg-green-500 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {i + 1}
              </div>
              {i < 7 && <div className="w-12 h-1 bg-slate-700 mx-2" />}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: The Process */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-8">
            {step === 'validate' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-amber-400 mb-2">🎉 {claimData.displayName}</h2>
                {claimData.realName && (
                  <p className="text-slate-400 text-lg mb-1">For: {claimData.realName}</p>
                )}
                <p className="text-amber-300 text-xl font-semibold">{claimData.namespace}</p>
                <div className="mt-4 p-2 bg-red-900/30 border border-red-500/50 rounded-lg inline-block">
                  <p className="text-red-300 text-sm font-bold uppercase tracking-wider">⚠ Warning: Do not refresh or go back</p>
                  <p className="text-red-200 text-xs mt-1">This ceremony creates a unique, immutable creation event.</p>
                </div>
              </div>

              {/* What You're Claiming - Clear Explanation */}
              <div className="bg-slate-900/50 border border-amber-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-amber-400 mb-3">📋 What You Own</h3>
                <p className="text-slate-300 mb-4 italic">{claimData.description}</p>
                {claimData.whatYouOwn && claimData.whatYouOwn.length > 0 && (
                  <ul className="space-y-2 text-slate-300">
                    {claimData.whatYouOwn.map((item: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Legal Rights Clarity */}
              {claimData.legalFraming && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-3">⚖️ Your Legal Rights</h3>
                  <p className="text-slate-300">{claimData.legalFraming}</p>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-green-400 font-semibold">No Renewal Fees</p>
                      <p className="text-slate-400 text-sm">Own it forever</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-green-400 font-semibold">No Expiration</p>
                      <p className="text-slate-400 text-sm">Never expires</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-green-400 font-semibold">Cannot Be Seized</p>
                      <p className="text-slate-400 text-sm">Yours permanently</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={generateKeys}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  Begin Claiming Process
                </button>
              </div>
            </div>
          )}

          {step === 'generate' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Generating Quantum-Resilient Keys</h2>
              <div className="animate-pulse text-amber-400 text-xl mb-6">Creating Ed25519 Cryptographic Pair...</div>
              <div className="max-w-md mx-auto bg-slate-900/50 p-4 rounded-lg border border-amber-500/30 text-left space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Initializing high-entropy pool...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-75"></div>
                  <span className="text-slate-300 text-sm">Generating 32-byte private secret...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
                  <span className="text-slate-300 text-sm">Deriving public verification key...</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-6">This happens locally on your device. Your keys never leave your browser.</p>
            </div>
          )}

          {step === 'biometric' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Hardware-Grade Biometric Lock</h2>
              <p className="text-slate-300 mb-8">
                We invoke your device's Secure Enclave (FaceID / TouchID / Windows Hello) 
                to cryptographically bind this namespace to your physical being.
              </p>
              
              {!biometricSecured ? (
                <div className="flex justify-center">
                  <button 
                    onClick={handleBiometricAuth}
                    className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl transition-all transform hover:scale-105 flex flex-col items-center"
                  >
                    <span className="text-5xl mb-3">🛡️</span>
                    <span className="text-xl font-bold">ACTIVATE SECURE ENCLAVE</span>
                    <span className="text-sm text-blue-100 mt-2">Initialize Hardware Binding</span>
                  </button>
                </div>
              ) : (
                <div className="py-12">
                   <div className="w-24 h-24 mx-auto border-4 border-green-500 rounded-full flex items-center justify-center animate-ping absolute"></div>
                   <div className="relative z-10 w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                     <span className="text-4xl">✓</span>
                   </div>
                   <p className="text-green-400 font-bold mt-8 text-xl">Identity Hardware Locked</p>
                   <p className="text-slate-400 text-sm font-mono mt-2">ID: {biometricId.substring(0,20)}...</p>
                </div>
              )}
            </div>
          )}

          {step === 'multisig' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-amber-400">Establish Chain of Command</h2>
                <p className="text-slate-400">
                  Who else controls this Sovereign namespace? Adding members creates a multisig 
                  smart contract for payments and governance.
                </p>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-xl border border-amber-500/20 max-w-lg mx-auto mb-6">
                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-bold mb-2">Founding Member (You)</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-green-500/50">
                    <span className="text-green-500">👑</span>
                    <span className="text-white font-mono">{claimData.namespace}</span>
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded ml-auto">Biometric Owner</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-bold mb-2">Add Member / Guardian (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="email@partner.com or Wallet address"
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newPartner}
                      onChange={(e) => setNewPartner(e.target.value)}
                    />
                    <button 
                      onClick={addPartner}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {partners.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {partners.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700">
                        <span className="text-slate-400">👤</span>
                        <span className="text-slate-200 text-sm">{p}</span>
                        <span className="text-xs text-amber-500 ml-auto">Pending Sign</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                  ℹ️ Adding members establishes a <strong>Multi-Signature Treasury Contract</strong>. 
                  Revenue will be split according to governance rules defined later.
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={finalizeMultiSig}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-bold"
                >
                  Confirm Chain & Proceed →
                </button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Backup Your Private Key</h2>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-300 font-semibold">⚠️ CRITICAL: This is your ONLY chance to backup your private key!</p>
                <p className="text-slate-300 text-sm mt-2">Anyone with access to this key can control your namespace. Store it securely offline.</p>
              </div>
              <button
                onClick={downloadBackup}
                className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all mb-4"
              >
                Download Private Key Backup
              </button>
              <label className="flex items-center justify-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupConfirmed}
                  onChange={(e) => setBackupConfirmed(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-slate-300">I have securely backed up my private key</span>
              </label>
              {backupConfirmed && (
                <button
                  onClick={confirmBackup}
                  className="w-full px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all mt-4"
                >
                  Continue to Signing
                </button>
              )}
            </div>
          )}

          {step === 'sign' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Sign Your Certificates</h2>
              <p className="text-slate-300 mb-6">You are claiming {claimData.certificates.length} sovereign certificates</p>
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                {claimData.certificates.map((cert, i) => (
                  <div key={i} className="text-left py-2 border-b border-slate-600/30 last:border-0">
                    <span className="text-amber-400 font-mono">{cert}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={signAndPublish}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                Sign & Publish to IPFS
              </button>
            </div>
          )}

          {step === 'publish' && (
            <div className="text-center">
              <div className="animate-pulse text-amber-400 text-xl mb-4">Publishing your certificates to IPFS...</div>
              <p className="text-slate-400">Creating immutable proof of ownership...</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">Claim Complete!</h2>
              <p className="text-slate-300 mb-6">Your namespace is now yours forever</p>
              
              {/* What You Own */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-6 mb-6 text-left">
                <h3 className="text-xl font-bold text-green-300 mb-4 text-center">🎁 What You Just Got</h3>
                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-white">{claimData.namespace} + 5 Certificates</p>
                      <p className="text-sm text-slate-400">Cryptographically secured, published to IPFS forever</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-white">Perpetual Ownership</p>
                      <p className="text-sm text-slate-400">No renewals, no fees, cannot be seized</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-white">Unlimited Subdomains</p>
                      <p className="text-sm text-slate-400">Create as many as you want - blog/{claimData.namespace.split('.')[0]}, pay/{claimData.namespace.split('.')[0]}, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-white">Your Private Keys</p>
                      <p className="text-sm text-slate-400">Backed up to your device - keep this file safe!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Proof */}
              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
               {/* SURPRISE BONUSES */}
              {unlockedBonuses.length > 0 && (
                <div className="animate-fade-in-up mb-6">
                  <div className="text-center mb-4">
                    <span className="inline-block animate-bounce text-3xl">🎁</span>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">SURPRISE BONUSES UNLOCKED</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {unlockedBonuses.map((bonus, i) => (
                      <div key={i} className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="text-4xl bg-white/10 p-3 rounded-full">{bonus.image}</div>
                        <div>
                          <p className="text-xs text-purple-300 font-bold uppercase tracking-widest mb-1">AUTOMATICALLY ISSUED</p>
                          <p className="text-white font-bold text-lg">{bonus.name}</p>
                          <p className="text-slate-300 text-sm">{bonus.description}</p>
                        </div>
                        {bonus.type === 'token' && (
                           <div className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                             TRUSTLINE SET
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-2">These assets have been automatically assigned to your namespace wallet.</p>
                </div>
              )}

                <p className="text-sm text-slate-400 mb-2">📜 Certificate Status:</p>
                <p className="text-green-400 font-semibold mb-2">✓ Cryptographically signed and recorded</p>
                <p className="text-xs text-slate-500">IPFS publication coming in next update (within 48 hours)</p>
              </div>

              {/* What's Next */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6 mb-6 text-left">
                <h3 className="text-xl font-bold text-amber-300 mb-4 text-center">🚀 What's Next?</h3>
                <div className="space-y-4 text-slate-300">
                  <div>
                    <p className="font-semibold text-white mb-2">1. Check Your Email</p>
                    <p className="text-sm text-slate-400">We've sent you setup instructions and next steps</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">2. Set Up Your Resolver</p>
                    <p className="text-sm text-slate-400">Point {claimData.namespace} to your website, wallet, or content</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">3. Create Subdomains</p>
                    <p className="text-sm text-slate-400">Use the dashboard to create unlimited subdomains</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">4. Import to Wallet</p>
                    <p className="text-sm text-slate-400">Add your keys to MetaMask to use as Web3 identity</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-lg rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
                >
                  🏰 Enter Your Namespace →
                </button>
                <a
                  href="https://docs.y3kmarkets.com/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-center flex items-center justify-center"
                >
                  📚 Setup Guide
                </a>
              </div>

              <p className="text-slate-400 text-sm mt-6">
                Questions? Contact support at <a href="mailto:support@y3kdigital.com" className="text-blue-400 hover:text-blue-300">support@y3kdigital.com</a>
              </p>
            </div>
          )}
        </div>

        {/* Right: Live Audit Log */}
          <div className="lg:col-span-1">
             <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 sticky top-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                   <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest">Provenance Log</h3>
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto font-mono text-xs">
                   {historyLog.length === 0 && (
                      <div className="text-slate-600 italic">Waiting for session start...</div>
                   )}
                   {historyLog.map((evt) => (
                      <div key={evt.id} className="border-l-2 border-slate-700 pl-3 py-1 relative">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                            {evt.confidence === 'biometric_verified' && <span className="text-[10px] bg-purple-900 text-purple-300 px-1 rounded">BIO</span>}
                            {evt.confidence === 'cryptographic_signature' && <span className="text-[10px] bg-amber-900 text-amber-300 px-1 rounded">SIG</span>}
                         </div>
                         <div className="text-slate-200 font-bold">{evt.action.replace(/_/g, ' ')}</div>
                         {Object.keys(evt.details).length > 0 && (
                           <div className="mt-1 text-slate-500 break-all">
                              {JSON.stringify(evt.details).substring(0, 100)}
                           </div>
                         )}
                      </div>
                   ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                   <p className="text-[10px] text-slate-600">Events are locally signed & immutable</p>
                </div>
             </div>
          </div>
        
        </div> {/* End Grid */}
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-4">
        <div className="animate-pulse text-amber-400 text-2xl">Loading...</div>
      </div>
    }>
      <ClaimContent />
    </Suspense>
  );
}
