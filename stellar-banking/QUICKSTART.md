# Quick Start Commands

## Initialize Complete Network

### PowerShell (Windows)
```powershell
cd C:\Users\Kevan\digital-giant-stellar
.\scripts\init-network.ps1
```

### Alternative: Manual Docker Compose
```powershell
docker-compose -f docker-compose.full.yml up -d
```

## Access URLs
- API: http://localhost:3000
- Horizon: http://localhost:8000
- Validator 1: http://localhost:11626
- Validator 2: http://localhost:12626
- Validator 3: http://localhost:13626

## Create Your First Token
```powershell
# 1. Create issuer account
curl -X POST http://localhost:3000/api/accounts/create

# 2. Issue token
curl -X POST http://localhost:3000/api/tokens/issue `
  -H "Content-Type: application/json" `
  -d '{
    "issuerSecret": "YOUR_SECRET_HERE",
    "assetCode": "DGIANT",
    "description": "Digital Giant Token",
    "totalSupply": "1000000"
  }'

# 3. Mint to distributor
curl -X POST http://localhost:3000/api/tokens/mint `
  -H "Content-Type: application/json" `
  -d '{
    "issuerSecret": "YOUR_SECRET_HERE",
    "distributorPublicKey": "DISTRIBUTOR_KEY_HERE",
    "assetCode": "DGIANT",
    "amount": "10000"
  }'
```

## Stop Network
```powershell
docker-compose -f docker-compose.full.yml down
```

## View Logs
```powershell
docker-compose -f docker-compose.full.yml logs -f
```
