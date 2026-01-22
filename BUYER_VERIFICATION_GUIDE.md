# How to Verify Your Y3K Genesis Namespace (Buyer's Guide)

**You own a piece of immutable digital history.** Here's how to independently verify it.

---

## What You Need to Know

Your Y3K namespace is backed by three layers of proof:

1. **Genesis Hash** – A unique cryptographic fingerprint of the entire ceremony
2. **IPFS Certificate** – Your specific namespace certificate, permanently published
3. **Public Verification** – Anyone can check these proofs, anytime

**No trust required. Pure cryptographic verification.**

---

## 🔍 Quick Verification (2 Minutes)

### Step 1: Find Your Certificate

Open this link (replace `XXX` with your namespace):

```
https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/certificates/XXX.json
```

**Examples:**
- For namespace `100`: [certificates/100.json](https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/certificates/100.json)
- For namespace `a`: [certificates/a.json](https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/certificates/a.json)
- For namespace `500`: [certificates/500.json](https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/certificates/500.json)

### Step 2: Check the Genesis Hash

Inside your certificate JSON, find:

```json
"genesis_hash": "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"
```

**This hash must match exactly.** It's the same for all 955 namespaces.

### Step 3: Verify on IPFS

The certificate is stored on IPFS (InterPlanetary File System), meaning:

- ✅ **Permanent** – Cannot be deleted
- ✅ **Immutable** – Cannot be changed
- ✅ **Decentralized** – Stored across multiple nodes worldwide

**Anyone can retrieve it, forever.**

---

## 🧪 Full Verification (Technical)

### View the Genesis Attestation

Official ceremony record:

```
https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/genesis_attestation.json
```

This document contains:
- Ceremony timestamp
- Total namespace count (955)
- Genesis hash
- Cryptographic signatures

### Browse All Certificates

Full directory view:

```
https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/
```

You'll see:
- `genesis_attestation.json`
- `manifest.json`
- `certificates/` (directory with all 955 certificates)

---

## ❓ FAQ

### Why does IPFS sometimes say "no providers found"?

**This is normal and does NOT mean your certificate is missing.**

IPFS has two concepts:
1. **Content retrievable** – Your certificate exists and can be downloaded
2. **Providers advertising** – Nodes announcing they have the content

Public gateways (like `ipfs.io`) serve content without advertising as providers. This is a DHT discovery quirk, not a content availability issue.

**If you can open the certificate URL, it exists. Period.**

### How do I know this is permanent?

IPFS uses **content addressing**. The CID (Content Identifier) is derived from the content itself using cryptographic hashing.

- If the content changes, the CID changes
- Same CID = same content, guaranteed
- Cannot be forged, backdated, or altered

The CID in your purchase receipt is your proof of authenticity.

### What if IPFS goes down?

IPFS is a distributed network with no single point of failure. Content is:

- Pinned on Y3K's nodes
- Cached by public gateways (ipfs.io, Cloudflare, dweb.link)
- Stored by any node that has accessed it

Even if Y3K disappeared, your certificate remains accessible through the network.

### Can I download my certificate?

**Yes.** Three ways:

**1. Browser (easiest)**
Right-click your certificate URL → Save As

**2. Command line (if you have IPFS installed)**
```bash
ipfs cat bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/certificates/XXX.json > my-certificate.json
```

**3. Download entire genesis archive**
```bash
ipfs get bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e
```

---

## 📞 Need Help?

- **Technical verification questions:** [support@y3k.digital](mailto:support@y3k.digital)
- **IPFS gateway issues:** Try alternate gateway (cloudflare-ipfs.com or dweb.link)
- **Genesis verification page:** https://y3k.digital/verify

---

## 🔐 Security Note

**Never share:**
- Your payment details
- Your account credentials
- Your wallet private keys (when applicable)

**Always verify:**
- Genesis hash matches: `0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc`
- IPFS CID matches: `bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e`
- Certificate contains your namespace

**You own the namespace, not just a receipt.**

---

*Last updated: January 16, 2026 – Genesis ceremony complete*
