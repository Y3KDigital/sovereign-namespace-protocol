# Friends & Family OS - User Manual

**Version 1.0 (Sovereign Edition)**
*Identity Root: `brad.x`*

---

##  Introduction
This is the Operating System for a Sovereign Individual.
It unifies Finance, Telephony, Communication, Time Management, and Secure Storage into a single, cryptographically secured command-line interface.

Unlike commercial apps, this OS runs **locally** on your machine. You own the data. You own the keys. You own the routing.

##  Quick Start

### 1. Verification
Ensure your identity is loaded:
```powershell
kevan-os status
```
*Expected Output:*
```text
Identity: brad.x
Phone:    +1-888-681-2729
Status:   ONLINE (Sovereign)
```

### 2. Configuration
The OS looks for `os-config.json` in the working directory.
```json
{
    "identity": "brad.x",
    "phone": "+1-888-681-2729",
    "storage": {
        "events_db": "./kevan.events.db",
        "vault_root": "./SAFE_DEPOSIT_BOX"
    }
}
```

---

##  Telephony (Sovereign Voice)
Your OS acts as a Private Branch Exchange (PBX). You control 29+ sovereign numbers.

**List Your Numbers**
View all numbers routed to your sovereign node.
```powershell
kevan-os tel numbers
```

**Make a Call**
Initiate a call via the sovereign SIP trunk (Telnyx/Twilio bridge).
```powershell
kevan-os tel call --to "+15550199"
```

**View Call Logs**
Audit your communication metadata.
```powershell
kevan-os tel logs
```

---

##  Finance (Sovereign Money)
Direct interface to the XRP Ledger and Sovereign payment rails.

**Check Wallet**
View balances across authorized trustlines.
```powershell
kevan-os finance wallet
```
*Displays: XRP Balance, Issued Assets (Love, Trust, etc.), and Rarity Score.*

**View Ledger**
See the immutable record of transactions.
```powershell
kevan-os finance history
```

**Send Payment**
Execute a cryptographic transfer.
```powershell
kevan-os finance pay --amount 100 --recipient "r..." --currency "XRP"
```

---

##  Mail (Sovereign Comms)
Unified messaging across Email, SMS, and encrypted channels (Signal).

**Check Inbox**
Read incoming communiques.
```powershell
kevan-os mail inbox
```

**Send Message**
Dispatch a secure message.
```powershell
brad-os mail send --to "family@brad.x" --body "Dinner at 7 PM"
```

**Emergency Broadcast**
Alert all contacts in your sovereign circle.
```powershell
kevan-os mail broadcast --message "Emergency protocol activated."
```

---

##  Calendar (Time Policy)
You set the rules for your time. The world requests access; you grant it.

**List Agenda**
See your sovereign schedule.
```powershell
kevan-os calendar list
```

**Add Event**
Block time on your terms.
```powershell
kevan-os calendar add --title "Strategy Meeting" --time "2026-02-01T10:00:00"
```

---

##  Vault (Secure Storage)
A local, encrypted file system for your most critical digital assets.

**Store File**
Secure a document (Will, Contract, Deed) into the vault.
```powershell
kevan-os vault store "C:\Path\To\Document.pdf"
```

**List Vault**
See secured assets.
```powershell
kevan-os vault list
```

---

##  Contacts (CRM)
Manage the web of trust relations within your namespace.

**List Contacts**
```powershell
kevan-os contacts list
```

**Add Contact**
```powershell
kevan-os contacts add --name "Alice" --phone "+1..." --trust-level "High"
```

---

## System Architecture

| Module | Crate | Function |
|--------|-------|----------|
| **Core** | `kevan-os` | CLI Router & Policy Engine |
| **Tel** | `kevan-tel` | SIP/Voice/SMS Bridge |
| **Finance** | `kevan-finance` | XRPL Interaction |
| **Mail** | `kevan-mail` | SMTP/Signal Gateway |
| **Calendar**| `kevan-calendar`| Time Sovereignty |
| **Policy** | `kevan-policy` | Access Control Logic |

*Powered by Rust. Secured by Cryptography. Owned by You.*

