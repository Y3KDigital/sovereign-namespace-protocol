#!/bin/bash
# Initialize Digital Giant Stellar Network
# This script bootstraps the entire blockchain infrastructure

set -e

echo "=========================================="
echo "Digital Giant Stellar Network Initializer"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Generate validator keys
echo -e "${YELLOW}Step 1: Generating validator keys...${NC}"

docker-compose -f docker-compose.full.yml run --rm validator-1 stellar-core gen-seed > validator1.key
docker-compose -f docker-compose.full.yml run --rm validator-2 stellar-core gen-seed > validator2.key
docker-compose -f docker-compose.full.yml run --rm validator-3 stellar-core gen-seed > validator3.key

echo -e "${GREEN}Validator keys generated!${NC}"
echo ""

# Extract public keys
VAL1_PUBLIC=$(grep "Public:" validator1.key | awk '{print $2}')
VAL2_PUBLIC=$(grep "Public:" validator2.key | awk '{print $2}')
VAL3_PUBLIC=$(grep "Public:" validator3.key | awk '{print $2}')

echo "Validator 1 Public Key: $VAL1_PUBLIC"
echo "Validator 2 Public Key: $VAL2_PUBLIC"
echo "Validator 3 Public Key: $VAL3_PUBLIC"
echo ""

# Step 2: Update configurations with actual keys
echo -e "${YELLOW}Step 2: Updating validator configurations...${NC}"

# Update config files with real validator keys
for config in stellar-core/*.cfg; do
    sed -i "s/VALIDATOR1_PUBLIC_KEY_HERE/$VAL1_PUBLIC/g" "$config"
    sed -i "s/VALIDATOR2_PUBLIC_KEY_HERE/$VAL2_PUBLIC/g" "$config"
    sed -i "s/VALIDATOR3_PUBLIC_KEY_HERE/$VAL3_PUBLIC/g" "$config"
done

echo -e "${GREEN}Configurations updated!${NC}"
echo ""

# Step 3: Initialize databases
echo -e "${YELLOW}Step 3: Starting databases...${NC}"

docker-compose -f docker-compose.full.yml up -d postgres-core postgres-horizon postgres-app redis

echo "Waiting for databases to be ready..."
sleep 10

echo -e "${GREEN}Databases started!${NC}"
echo ""

# Step 4: Start validators
echo -e "${YELLOW}Step 4: Starting validator nodes...${NC}"

docker-compose -f docker-compose.full.yml up -d validator-1 validator-2 validator-3

echo "Waiting for validators to sync..."
sleep 30

echo -e "${GREEN}Validators started!${NC}"
echo ""

# Step 5: Start Horizon
echo -e "${YELLOW}Step 5: Starting Horizon API server...${NC}"

docker-compose -f docker-compose.full.yml up -d horizon

echo "Waiting for Horizon to initialize..."
sleep 20

echo -e "${GREEN}Horizon started!${NC}"
echo ""

# Step 6: Start application services
echo -e "${YELLOW}Step 6: Starting application services...${NC}"

docker-compose -f docker-compose.full.yml up -d api nginx

echo -e "${GREEN}Application services started!${NC}"
echo ""

# Step 7: Verify network
echo -e "${YELLOW}Step 7: Verifying network status...${NC}"

echo "Checking Validator 1..."
curl -s http://localhost:11626/info | grep -q "state" && echo -e "${GREEN}✓ Validator 1 is running${NC}" || echo -e "${RED}✗ Validator 1 check failed${NC}"

echo "Checking Horizon..."
curl -s http://localhost:8000/ | grep -q "horizon" && echo -e "${GREEN}✓ Horizon is running${NC}" || echo -e "${RED}✗ Horizon check failed${NC}"

echo "Checking API..."
curl -s http://localhost:3000/health | grep -q "healthy" && echo -e "${GREEN}✓ API is running${NC}" || echo -e "${RED}✗ API check failed${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Digital Giant Stellar Network is LIVE!${NC}"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  - Validator 1: http://localhost:11626"
echo "  - Validator 2: http://localhost:12626"
echo "  - Validator 3: http://localhost:13626"
echo "  - Horizon API: http://localhost:8000"
echo "  - Application API: http://localhost:3000"
echo "  - Web Interface: http://localhost:80"
echo ""
echo "Network Info:"
echo "  - Network Passphrase: Digital Giant Stellar Network ; January 2026"
echo "  - Validator Keys saved in: validator1.key, validator2.key, validator3.key"
echo ""
echo -e "${YELLOW}IMPORTANT: Keep your validator keys secure!${NC}"
echo ""
