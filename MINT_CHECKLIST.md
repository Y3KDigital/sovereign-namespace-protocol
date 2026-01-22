# Reserved Namespace Minting - Quick Start Checklist

**Date:** January 13, 2026  
**Objective:** Lock Tier 0 and Tier 1 namespaces before public launch

---

## ✅ Pre-Mint Checklist

### 1. Review & Approval
- [ ] Read [PROTOCOL_RESERVED_NAMESPACES.md](PROTOCOL_RESERVED_NAMESPACES.md)
- [ ] Review complete namespace list in [genesis/PROTOCOL_NAMESPACES.json](genesis/PROTOCOL_NAMESPACES.json)
- [ ] Approve Tier 0 (19 constitutional namespaces)
- [ ] Approve Tier 1 (41 strategic asset namespaces)
- [ ] Sign off on transfer policies

### 2. Technical Validation
- [ ] Verify snp-core compiles: `cargo build --release -p snp-core`
- [ ] Confirm genesis hash: `0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc`
- [ ] Test minting script (dry run): `.\scripts\mint-reserved-namespaces.ps1 -DryRun`
- [ ] Verify script output format

### 3. Infrastructure Setup
- [ ] Generate protocol multisig address (4-of-7)
- [ ] Configure treasury wallet
- [ ] Set up monitoring for namespace registry
- [ ] Prepare backup/recovery procedures

---

## 🚀 Minting Execution

### Step 1: Dry Run (5 minutes)

```powershell
# Navigate to project root
cd "c:\Users\Kevan\web3 true web3 rarity"

# Execute dry run with verbose output
.\scripts\mint-reserved-namespaces.ps1 -DryRun -Verbose

# Expected output:
# ✓ 19 Tier 0 namespaces (would mint)
# ✓ 41 Tier 1 namespaces (would mint)
# ✓ 60 total namespaces (dry-run)
```

**Validation:**
- [ ] Script runs without errors
- [ ] All 60 namespaces listed
- [ ] Correct sovereignty classes assigned
- [ ] Output format is readable

---

### Step 2: Execute Minting (15 minutes)

```powershell
# Execute actual minting
.\scripts\mint-reserved-namespaces.ps1 -GenesisHash "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"

# Monitor output for:
# - Progress per namespace
# - Success confirmations
# - Any errors or warnings
```

**Expected Result:**
```
📊 Minting Summary
==================

Tier 0 (Constitutional):  19 namespaces
Tier 1 (Strategic):       41 namespaces
Total:                    60 namespaces

✅ Successful: 60
📄 Results saved to: genesis/minted/minted-namespaces-20260113-HHMMSS.json
```

**Validation:**
- [ ] All 60 namespaces minted successfully
- [ ] Zero failed transactions
- [ ] Results JSON file created
- [ ] Namespace IDs generated correctly

---

### Step 3: Verify On-Chain (10 minutes)

```powershell
# Verify each namespace exists in registry
# (Replace with actual verification command)

# For each critical namespace:
cargo run --release --bin snp -- namespace verify --id <NAMESPACE_ID>

# Priority verifications:
# - y3k
# - y3k.protocol
# - law
# - bank
# - ai
```

**Checks:**
- [ ] Tier 0 namespaces exist on-chain
- [ ] Tier 1 namespaces exist on-chain
- [ ] Sovereignty classes correct
- [ ] Genesis binding validated

---

### Step 4: Transfer to Multisig (10 minutes)

```powershell
# Transfer ownership of all minted namespaces to protocol multisig
# (Replace with actual transfer command)

# Load minted results
$results = Get-Content "genesis/minted/minted-namespaces-YYYYMMDD-HHMMSS.json" | ConvertFrom-Json

# For each namespace, execute transfer
foreach ($ns in $results.tier_0 + $results.tier_1) {
    # Transfer to multisig
    # snp-cli transfer --namespace-id $ns.id --to $MULTISIG_ADDRESS
}
```

**Validation:**
- [ ] All 60 namespaces owned by multisig
- [ ] Transfer transactions confirmed
- [ ] Ownership verifiable on-chain
- [ ] No remaining admin keys

---

## 📋 Post-Mint Checklist

### 1. Documentation
- [ ] Update [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) with actual IDs
- [ ] Record all namespace IDs in registry
- [ ] Document multisig signers
- [ ] Create operational runbook

### 2. Monitoring
- [ ] Set up alerts for namespace transfers
- [ ] Monitor subdomain creation
- [ ] Track delegation requests
- [ ] Log all governance actions

### 3. Communication
- [ ] Internal announcement (team)
- [ ] Partner notification (if applicable)
- [ ] Documentation publish (public docs)
- [ ] Social media preparation (hold until usage active)

---

## ⚡ Phase 2: Active Usage (Week 2)

### Immediate Next Steps

**1. Route law.y3k (Priority 1)**
```
Phone: +1-800-LAW-Y3K (+1-800-529-9935)
API: https://api.law.y3k
AI Agent: agent://law.y3k/intake-bot

Expected routing:
Call +1-800-LAW-Y3K → Y3K phone router → Legal intake system
```

- [ ] Configure phone number routing
- [ ] Deploy API endpoint
- [ ] Register AI agent
- [ ] Test end-to-end routing
- [ ] Document routing architecture

**2. Create First Subdomain (Priority 2)**
```
Parent: law (0x...)
Subdomain: intake.law
Delegatee: LegalTech Partner (if partnership ready) or Internal (for demo)
```

- [ ] Execute subdomain derivation
- [ ] Document delegation terms
- [ ] Register subdomain routing
- [ ] Test subdomain functionality

**3. Marketplace Display (Priority 3)**
- [ ] Deploy ReservedNamespaceCard component
- [ ] Create /reserved page on Y3K Markets
- [ ] Add "Request Partnership" form
- [ ] Link documentation
- [ ] Test user experience

---

## 🎯 Success Criteria

**Genesis Mint Complete When:**
- ✅ 60 namespaces minted (19 Tier 0 + 41 Tier 1)
- ✅ All namespaces owned by protocol multisig
- ✅ On-chain verification passed
- ✅ Zero governance disputes
- ✅ Documentation updated

**Phase 2 Active Usage Complete When:**
- ✅ ≥3 namespaces routing live traffic
- ✅ ≥1 subdomain delegated
- ✅ ≥1 AI agent registered
- ✅ Marketplace displaying reserved names
- ✅ Partnership framework published

---

## 🆘 Troubleshooting

### If Minting Fails

**Error: "Namespace already exists"**
- Check if name was previously minted
- Verify genesis hash matches
- Confirm sovereignty class is correct

**Error: "CLI not found"**
- Build snp-cli: `cargo build --release --bin snp`
- Verify PATH includes target/release
- Try absolute path to binary

**Error: "Permission denied"**
- Check script execution policy: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Run as administrator if needed
- Verify file permissions

### If Verification Fails

**Namespace ID mismatch:**
- Re-derive namespace locally
- Compare with on-chain data
- Check genesis hash binding

**Ownership incorrect:**
- Verify transfer transaction
- Check multisig address
- Re-attempt transfer if needed

---

## 📞 Emergency Contacts

**Protocol Team:**
- Technical Lead: @tech-lead
- Security: @security-team
- Governance: @governance

**Escalation Path:**
1. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
2. Review [PROTOCOL_RESERVED_NAMESPACES.md](PROTOCOL_RESERVED_NAMESPACES.md)
3. Contact technical lead
4. Escalate to governance if needed

---

## 📝 Execution Log

**Executed By:** _______________  
**Date/Time:** _______________  
**Genesis Hash Used:** _______________  
**Multisig Address:** _______________  
**Results File:** _______________  

**Namespaces Minted:**
- Tier 0: _____ / 19
- Tier 1: _____ / 41
- Total: _____ / 60

**Issues Encountered:** _______________  
**Resolution:** _______________  

**Sign-off:**
- [ ] Technical Lead: _______________
- [ ] Security Review: _______________
- [ ] Governance Approval: _______________

---

**Ready to execute? Follow the steps above.**  
**Questions? See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for full details.**

---

*This is infrastructure. Execute with precision.*
