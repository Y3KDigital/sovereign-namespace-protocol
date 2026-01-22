# Integration Guide: Connect Stellar Banking System to Y3K Workspace

**Date**: January 20, 2026  
**Objective**: Integrate working Stellar issuance system from `digital-giant-stellar` into this workspace

---

## What We Need to Copy

You have a **WORKING system** at `C:\Users\Kevan\digital-giant-stellar` that successfully issued ELON token on mainnet.

### Files I Need You to Copy:

#### 1. **Stellar Issuance Script**
**From**: `C:\Users\Kevan\digital-giant-stellar\[location]`  
**To**: `C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\namespace-issuance.js`

**What it does**:
- Accepts namespace and asset code
- Creates issuer account
- Creates distributor account
- Issues tokens
- Returns transaction hash

#### 2. **API Configuration**
**From**: `C:\Users\Kevan\digital-giant-stellar\.env` (or config file)  
**To**: `C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\.env`

**Variables needed**:
```env
# Stellar Network
STELLAR_NETWORK=PUBLIC  # or TESTNET
STELLAR_HORIZON_URL=https://horizon.stellar.org

# API Endpoints
STELLAR_API_URL=http://localhost:13000  # Your Digital Giant API
CLAIM_SERVICE_URL=http://localhost:3005  # Y3K Listener

# Registry
REGISTRY_DB_PATH=./data/registry.db  # Where claim data is stored
```

#### 3. **PowerShell Module** (if different from current)
**Current**: `y3k-markets-web\scripts\Y3KIssuance.psm1` (393 lines)
**Check if banking build has updated version**

#### 4. **Registry/Database Schema**
**From**: `C:\Users\Kevan\digital-giant-stellar\[registry]`  
**What we need**: The database or JSON file that stores:
- Namespace claims
- Issuer public keys
- Distributor keys
- Transaction hashes
- Status (CLAIMED, ISSUED, etc.)

---

## Integration Steps

### Step 1: Copy the Working Issuance Script

**Action Required**:
```powershell
# Copy the script that created ELON token
Copy-Item "C:\Users\Kevan\digital-giant-stellar\[PATH_TO_ISSUANCE_SCRIPT]\*.js" `
          "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\scripts\"
```

**What to copy**:
- The JavaScript file that calls Stellar SDK
- Creates accounts
- Issues tokens
- Locks issuer

### Step 2: Copy Configuration

**Action Required**:
```powershell
# Copy .env or config file
Copy-Item "C:\Users\Kevan\digital-giant-stellar\.env" `
          "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\"

# Or merge configs if .env already exists
```

### Step 3: Copy Registry Database

**Action Required**:
```powershell
# Copy registry that tracks namespace state
Copy-Item "C:\Users\Kevan\digital-giant-stellar\data\*" `
          "C:\Users\Kevan\web3 true web3 rarity\y3k-markets-web\data\" -Recurse
```

### Step 4: Link to Digital Giant API

**Two Options**:

#### Option A: Keep Digital Giant Running Separately
- Digital Giant runs at `localhost:13000`
- This workspace's PowerShell module calls it
- **Pros**: Don't need to move everything
- **Cons**: Two places to manage

#### Option B: Move Digital Giant Here
- Copy entire `digital-giant-stellar` folder into this workspace
- Run it as part of this project
- **Pros**: Everything in one place
- **Cons**: Larger codebase

---

## Questions for You

### 1. **Location of Issuance Script**
Where is the script that created ELON token?
```
C:\Users\Kevan\digital-giant-stellar\[???]\namespace-issuance.js
C:\Users\Kevan\digital-giant-stellar\[???]\issue-token.js
C:\Users\Kevan\digital-giant-stellar\[???]\stellar-issuer.js
```

### 2. **Registry Location**
Where is the database that stores namespace claims?
```
C:\Users\Kevan\digital-giant-stellar\data\registry.db?
C:\Users\Kevan\digital-giant-stellar\claims.json?
C:\Users\Kevan\digital-giant-stellar\namespace-state.db?
```

### 3. **Digital Giant API**
Is Digital Giant a:
- **Node.js server** with REST API?
- **Rust binary** with HTTP endpoints?
- **Python service**?
- **Other**?

### 4. **PowerShell Module**
Is there an updated version of `Y3KIssuance.psm1` in the banking build?
```
C:\Users\Kevan\digital-giant-stellar\scripts\Y3KIssuance.psm1?
```

---

## What You Can Do Right Now

### Option 1: Give Me the Files (RECOMMENDED)

**Run these commands and tell me what files exist**:

```powershell
# 1. List all JavaScript files
cd "C:\Users\Kevan\digital-giant-stellar"
Get-ChildItem -Filter *.js -Recurse | Select-Object FullName

# 2. Find issuance-related scripts
Get-ChildItem -Recurse -Filter "*issue*" | Select-Object FullName

# 3. Find registry/database files
Get-ChildItem -Recurse -Filter "*registry*" | Select-Object FullName
Get-ChildItem -Recurse -Filter "*.db" | Select-Object FullName
Get-ChildItem -Recurse -Filter "*claim*" | Select-Object FullName

# 4. Check for .env file
Get-Content ".env" -ErrorAction SilentlyContinue
```

### Option 2: Copy Entire Folder

**If you want everything in one place**:

```powershell
# Copy entire working system
Copy-Item "C:\Users\Kevan\digital-giant-stellar" `
          "C:\Users\Kevan\web3 true web3 rarity\stellar-banking" -Recurse

# Then I'll integrate it
```

### Option 3: Show Me the Structure

**Run this to see what's in the working system**:

```powershell
cd "C:\Users\Kevan\digital-giant-stellar"
Get-ChildItem -Recurse -Depth 2 | Select-Object FullName, Length | Format-Table
```

---

## Integration Checklist

Once you provide the files, I will:

- [ ] Copy `namespace-issuance.js` to `y3k-markets-web/scripts/`
- [ ] Update `.env` with Stellar configuration
- [ ] Copy registry database to local data folder
- [ ] Link PowerShell module to Digital Giant API
- [ ] Test with 333.x (100 tokens, minimal risk)
- [ ] Issue brad.x (1M tokens, first F&F)
- [ ] Document the integrated system
- [ ] Create startup script that launches both systems together

---

## Expected Final Structure

```
y3k-markets-web/
├── scripts/
│   ├── Y3KIssuance.psm1 (PowerShell module - exists)
│   └── namespace-issuance.js (Bridge to Stellar - NEED THIS)
├── data/
│   └── registry.db (Namespace state - NEED THIS)
├── .env (Stellar config - NEED THIS)
└── stellar-banking/ (Optional: Copy of digital-giant-stellar)
    ├── API server
    ├── Stellar SDK integration
    └── Account management
```

---

## Your Next Step

**Choose one**:

1. **Run the discovery commands above** → Tell me what files exist
2. **Copy entire `digital-giant-stellar` folder here** → I'll integrate it
3. **Open `digital-giant-stellar` in another VS Code window** → Give me access to read those files

**Which approach do you prefer?**
