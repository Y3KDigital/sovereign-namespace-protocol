# Architecture Overview

## System Components

### 1. Core Services

#### Stellar Service (`stellar.service.ts`)
- Connects to Stellar Horizon API
- Manages Stellar accounts and keypairs
- Handles payments and transactions
- Provides real-time transaction streaming
- Supports custom assets and multi-signature

**Key Features:**
- Account creation and management
- Payment transactions
- Balance queries
- Transaction history
- Real-time event streaming

#### XRPL Service (`xrpl.service.ts`)
- Connects to XRPL network
- Manages XRPL wallets
- Handles XRP payments
- Provides account information
- Transaction subscription support

**Key Features:**
- Wallet creation and management
- XRP payments
- Balance queries
- Transaction history
- Real-time transaction monitoring

#### Bridge Service (`bridge.service.ts`)
- Orchestrates cross-chain transfers
- Manages transaction state
- Calculates and applies bridge fees
- Provides transaction status tracking
- Handles error recovery

**Key Features:**
- Bidirectional transfers (Stellar ↔ XRPL)
- Fee calculation and management
- Transaction tracking
- Status monitoring
- Error handling and rollback

### 2. API Layer

#### REST API Endpoints

**Accounts API** (`/api/accounts`)
- Create new accounts
- Get account information
- Query balances
- Retrieve transaction history

**Payments API** (`/api/payments`)
- Send payments
- Query payment history
- Support for custom assets

**XRPL API** (`/api/xrpl`)
- Create XRPL wallets
- Check balances
- Get transaction history
- Account information

**Bridge API** (`/api/bridge`)
- Initiate cross-chain transfers
- Check transfer status
- List pending transactions

### 3. Infrastructure

#### Database Layer (PostgreSQL)
- Account storage
- Transaction history
- Bridge transaction tracking
- Asset information
- Audit logs

**Schema:**
- `accounts` - Network account information
- `transactions` - All transactions
- `bridge_transactions` - Cross-chain transfers
- `assets` - Supported assets

#### Caching Layer (Redis)
- Rate limiting
- Session management
- Transaction caching
- Performance optimization

#### API Gateway (Nginx)
- Load balancing
- SSL termination
- Request routing
- Static content serving

## Data Flow

### Standard Payment Flow

```
Client Request
    ↓
Rate Limiter
    ↓
Input Validation
    ↓
Service Layer (Stellar/XRPL)
    ↓
Network API (Horizon/XRPL Node)
    ↓
Response → Client
```

### Cross-Chain Bridge Flow

```
Client Request (Bridge Transfer)
    ↓
Validation & Fee Calculation
    ↓
Bridge Service
    ├─→ Lock assets on Source Network
    │
    ├─→ Verify Lock Transaction
    │
    ├─→ Mint/Transfer on Destination Network
    │
    └─→ Verify Completion
    ↓
Update Transaction Status
    ↓
Response → Client
```

## Security Architecture

### API Security
- **Helmet.js**: HTTP security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schemas
- **Error Handling**: Secure error messages

### Network Security
- Environment-based configuration
- Secret management
- Secure key storage
- HTTPS enforcement (production)
- Network isolation (Docker)

### Operational Security
- Structured logging
- Error tracking
- Health monitoring
- Graceful shutdown
- Process management

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Redis for shared state
- Database connection pooling
- Load balancing ready

### Performance Optimization
- Caching strategies
- Database indexing
- Efficient queries
- Connection reuse
- Async operations

### Monitoring
- Health checks
- Metrics collection
- Log aggregation
- Error tracking
- Performance monitoring

## Deployment Architecture

### Development
```
Local Machine
├── API Service (Port 3000)
├── PostgreSQL (Port 5432)
└── Redis (Port 6379)
```

### Production (Docker)
```
Docker Host
├── Nginx (80/443) → API Service
├── API Service (Container)
├── PostgreSQL (Container)
└── Redis (Container)
```

### Cloud (Scalable)
```
Load Balancer
    ↓
API Instances (Auto-scaling)
    ↓
├── PostgreSQL (Managed DB)
├── Redis (Managed Cache)
└── Message Queue (Future)
```

## Future Enhancements

### Phase 1
- WebSocket API for real-time updates
- Enhanced transaction validation
- Multi-signature support
- Advanced error recovery

### Phase 2
- Smart contract integration
- Advanced routing algorithms
- Liquidity pools
- Atomic swaps

### Phase 3
- Mobile SDK
- Additional network support
- Governance features
- Staking mechanisms

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js
- **Blockchain SDKs**: 
  - @stellar/stellar-sdk
  - xrpl.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Proxy**: Nginx
- **Testing**: Jest
- **Logging**: Winston
- **Validation**: Joi
