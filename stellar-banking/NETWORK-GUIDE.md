# Digital Giant Stellar Network - Complete Infrastructure Guide

## Full Layer 1 Blockchain System

This is a **complete Stellar blockchain fork** with:
- ✅ 3 Validator Nodes (consensus network)
- ✅ Horizon API Server (blockchain data access)
- ✅ Token Minting Infrastructure
- ✅ Cross-chain Bridge (XRPL integration)
- ✅ Full Node.js API
- ✅ Load Balancer
- ✅ Multi-database architecture

---

## 🏗️ Infrastructure Components

### Layer 1 - Blockchain Validators
- **Validator 1**: Primary validator node (Port 11625/11626)
- **Validator 2**: Secondary validator node (Port 12625/12626)
- **Validator 3**: Tertiary validator node (Port 13625/13626)

**Consensus**: 67% threshold (2 of 3 validators)

### Layer 2 - API & Services
- **Horizon API**: Blockchain data and queries (Port 8000)
- **Application API**: Business logic and integrations (Port 3000)
- **Nginx**: Load balancer and reverse proxy (Port 80/443)

### Data Layer
- **PostgreSQL Core**: 3 databases for validators (Port 5433)
- **PostgreSQL Horizon**: Horizon data storage (Port 5434)
- **PostgreSQL App**: Application data (Port 5432)
- **Redis**: Caching and rate limiting (Port 6379)

---

## 🚀 Quick Start

### Option 1: Initialize Full Network (Recommended)

**PowerShell:**
```powershell
cd C:\Users\Kevan\digital-giant-stellar
.\scripts\init-network.ps1
```

**Bash:**
```bash
cd /path/to/digital-giant-stellar
chmod +x scripts/init-network.sh
./scripts/init-network.sh
```

This script will:
1. Generate validator keys
2. Configure quorum sets
3. Initialize all databases
4. Start validator nodes
5. Launch Horizon API
6. Deploy application services
7. Verify network health

### Option 2: Manual Setup

**Step 1: Start Full Infrastructure**
```powershell
docker-compose -f docker-compose.full.yml up -d
```

**Step 2: Wait for Initialization**
```powershell
# Monitor logs
docker-compose -f docker-compose.full.yml logs -f
```

**Step 3: Verify Services**
```powershell
# Check validators
curl http://localhost:11626/info
curl http://localhost:12626/info
curl http://localhost:13626/info

# Check Horizon
curl http://localhost:8000/

# Check API
curl http://localhost:3000/health
```

---

## 🪙 Token Minting System

### Issue a New Token

```bash
POST http://localhost:3000/api/tokens/issue

{
  "issuerSecret": "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "assetCode": "DGIANT",
  "description": "Digital Giant Token",
  "totalSupply": "1000000",
  "metadata": {
    "homepage": "https://digitalgiant.com",
    "image": "https://digitalgiant.com/token.png"
  }
}
```

### Mint Tokens

```bash
POST http://localhost:3000/api/tokens/mint

{
  "issuerSecret": "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "distributorPublicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "assetCode": "DGIANT",
  "amount": "10000"
}
```

### Establish Trustline

```bash
POST http://localhost:3000/api/tokens/trustline

{
  "accountSecret": "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "assetCode": "DGIANT",
  "issuerPublicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "limit": "100000"
}
```

### Airdrop Tokens

```bash
POST http://localhost:3000/api/tokens/airdrop

{
  "issuerSecret": "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "assetCode": "DGIANT",
  "recipients": [
    {"address": "GXXX...XXX", "amount": "100"},
    {"address": "GYYY...YYY", "amount": "200"},
    {"address": "GZZZ...ZZZ", "amount": "150"}
  ]
}
```

### Lock Token Issuance (Permanent)

```bash
POST http://localhost:3000/api/tokens/lock

{
  "issuerSecret": "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "assetCode": "DGIANT"
}
```

### Burn Tokens

```bash
POST http://localhost:3000/api/tokens/burn

{
  "holderSecret": "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "assetCode": "DGIANT",
  "issuerPublicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "amount": "500"
}
```

---

## 📡 API Endpoints

### Network & Accounts
```
POST   /api/accounts/create           - Create new account
GET    /api/accounts/:id              - Get account info
GET    /api/accounts/:id/balances     - Get balances
GET    /api/accounts/:id/transactions - Get transaction history
```

### Payments
```
POST   /api/payments/send             - Send payment
GET    /api/payments/:accountId       - Get payment history
```

### Tokens (Complete Minting System)
```
POST   /api/tokens/issue              - Issue new token
POST   /api/tokens/mint               - Mint tokens
POST   /api/tokens/trustline          - Establish trustline
POST   /api/tokens/lock               - Lock issuance
POST   /api/tokens/burn               - Burn tokens
POST   /api/tokens/airdrop            - Airdrop to multiple accounts
GET    /api/tokens/:code/:issuer      - Get token info
GET    /api/tokens/issued/:issuer     - Get all issued tokens
```

### Cross-Chain Bridge
```
POST   /api/bridge/transfer           - Cross-chain transfer
GET    /api/bridge/status/:txId       - Check transfer status
GET    /api/bridge/pending            - Get pending transfers
```

### XRPL Integration
```
POST   /api/xrpl/wallet/create        - Create XRPL wallet
GET    /api/xrpl/account/:address     - Get account info
GET    /api/xrpl/balance/:address     - Get balance
GET    /api/xrpl/transactions/:address - Get transactions
```

---

## 🔐 Network Configuration

### Network Details
- **Name**: Digital Giant Stellar Network
- **Passphrase**: `Digital Giant Stellar Network ; January 2026`
- **Type**: Private/Testnet (configurable for mainnet)
- **Consensus**: Stellar Consensus Protocol (SCP)
- **Quorum**: 67% (2 of 3 validators)

### Validator Keys
After initialization, validator keys are stored in:
- `validator1.key`
- `validator2.key`
- `validator3.key`

**⚠️ CRITICAL**: Back up these keys securely!

---

## 📊 Monitoring

### Health Checks
```powershell
# Overall system
curl http://localhost:3000/health

# Individual validators
curl http://localhost:11626/info  # Validator 1
curl http://localhost:12626/info  # Validator 2
curl http://localhost:13626/info  # Validator 3

# Horizon API
curl http://localhost:8000/

# Check quorum
curl http://localhost:11626/quorum
```

### View Logs
```powershell
# All services
docker-compose -f docker-compose.full.yml logs -f

# Specific service
docker-compose -f docker-compose.full.yml logs -f validator-1
docker-compose -f docker-compose.full.yml logs -f horizon
docker-compose -f docker-compose.full.yml logs -f api
```

### Container Status
```powershell
docker-compose -f docker-compose.full.yml ps
```

---

## 🛠️ Management Commands

### Start Network
```powershell
docker-compose -f docker-compose.full.yml up -d
```

### Stop Network
```powershell
docker-compose -f docker-compose.full.yml down
```

### Restart Services
```powershell
docker-compose -f docker-compose.full.yml restart
```

### Rebuild Images
```powershell
docker-compose -f docker-compose.full.yml build --no-cache
docker-compose -f docker-compose.full.yml up -d
```

### Reset Everything
```powershell
# WARNING: This deletes all data!
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.full.yml up -d
```

---

## 🔧 Advanced Configuration

### Add More Validators
1. Copy `stellar-core-validator3.cfg` to `stellar-core-validator4.cfg`
2. Update configuration with unique database
3. Add service to `docker-compose.full.yml`
4. Update quorum set in all validator configs
5. Restart network

### Enable Smart Contracts (Soroban)
Already enabled in validator configurations!

```toml
EXPERIMENTAL_BUCKETLIST_DB=true
ENABLE_SOROBAN_DIAGNOSTIC_EVENTS=true
```

### Custom Network Passphrase
Edit all validator configs:
```toml
NETWORK_PASSPHRASE="Your Custom Network ; Date"
```

---

## 🌐 Production Deployment

### Enable SSL/TLS
1. Obtain SSL certificates
2. Place in `./ssl/` directory
3. Uncomment SSL server block in `nginx-full.conf`
4. Restart nginx:
```powershell
docker-compose -f docker-compose.full.yml restart nginx
```

### Security Checklist
- [ ] Change all database passwords
- [ ] Rotate validator keys regularly
- [ ] Enable firewall rules
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Enable SSL/TLS
- [ ] Restrict admin ports
- [ ] Set up DDoS protection

---

## 📈 Performance Tuning

### Database Optimization
```sql
-- Connect to PostgreSQL
docker exec -it digitalgiant-postgres-core psql -U stellar

-- Run VACUUM and ANALYZE
VACUUM ANALYZE;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Scale Validators
Increase validator resources in `docker-compose.full.yml`:
```yaml
validator-1:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 4G
```

---

## 🐛 Troubleshooting

### Validators Not Syncing
```powershell
# Check validator logs
docker-compose -f docker-compose.full.yml logs validator-1

# Verify quorum configuration
docker exec digitalgiant-validator-1 stellar-core http-command 'quorum'

# Reset validator
docker-compose -f docker-compose.full.yml restart validator-1
```

### Horizon Not Ingesting
```powershell
# Check Horizon logs
docker-compose -f docker-compose.full.yml logs horizon

# Restart Horizon
docker-compose -f docker-compose.full.yml restart horizon
```

### Database Connection Issues
```powershell
# Check database status
docker-compose -f docker-compose.full.yml ps postgres-core

# Test connection
docker exec digitalgiant-postgres-core pg_isready -U stellar
```

---

## 📚 Additional Resources

- **Stellar Documentation**: https://developers.stellar.org
- **Horizon API Docs**: https://developers.stellar.org/api/horizon
- **Stellar Core Config**: https://developers.stellar.org/docs/run-core-node
- **Token Specs (SEP-0001)**: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md

---

## 🎯 Next Steps

1. **Initialize Network**: Run `init-network.ps1`
2. **Create Master Account**: Use `/api/accounts/create`
3. **Issue Your First Token**: Use `/api/tokens/issue`
4. **Distribute Tokens**: Use `/api/tokens/mint` or `/api/tokens/airdrop`
5. **Monitor Network**: Check validator status regularly
6. **Build Applications**: Integrate with your XRPL platform

---

**Digital Giant Stellar Infrastructure** - Your complete Layer 1 blockchain solution! 🚀
