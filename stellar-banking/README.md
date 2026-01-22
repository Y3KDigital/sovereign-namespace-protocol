# Digital Giant Stellar Infrastructure

A lightweight, modular fork of Stellar's blockchain infrastructure integrated with XRPL (XRP Ledger) platform, enabling seamless cross-chain transactions and asset transfers.

## 🌟 Features

- **Stellar Core Integration**: Lightweight implementation of Stellar blockchain capabilities
- **XRPL Integration**: Full XRP Ledger connectivity and transaction support
- **Cross-Chain Bridge**: Seamless asset transfers between Stellar and XRPL networks
- **RESTful API**: Comprehensive API endpoints for all operations
- **Microservices Architecture**: Modular, scalable service design
- **Docker Support**: Fully containerized for easy deployment
- **Real-time Updates**: WebSocket support for transaction streaming
- **Security First**: Rate limiting, input validation, and secure key management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   API Gateway                       │
│              (Express + Rate Limiting)              │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
       ┌───────▼────────┐    ┌───────▼────────┐
       │ Stellar Service│    │  XRPL Service  │
       └───────┬────────┘    └───────┬────────┘
               │                     │
               └──────────┬──────────┘
                          │
                  ┌───────▼────────┐
                  │ Bridge Service │
                  │ (Cross-Chain)  │
                  └────────────────┘
```

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 15 (for production)
- Redis 7 (for caching)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to project directory
cd digital-giant-stellar

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Edit .env with your configuration
notepad .env
```

### 2. Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

### 3. Docker Deployment

```bash
# Build and start all services
npm run docker:up

# Stop all services
npm run docker:down

# Or use docker-compose directly
docker-compose up -d
```

## 🔧 Configuration

Edit `.env` file with your settings:

```env
# Network Configuration
STELLAR_NETWORK=testnet
XRPL_NETWORK=testnet

# API Settings
PORT=3000
API_RATE_LIMIT=100

# Bridge Configuration
BRIDGE_ENABLED=true
BRIDGE_MIN_AMOUNT=1
BRIDGE_FEE_PERCENT=0.5
```

## 📚 API Documentation

### Health Check
```
GET /health
```

### Accounts

#### Create Stellar Account
```
POST /api/accounts/create
```

#### Get Account Info
```
GET /api/accounts/:accountId
```

#### Get Balances
```
GET /api/accounts/:accountId/balances
```

### Payments

#### Send Payment
```
POST /api/payments/send
Body: {
  "sourceSecret": "string",
  "destinationId": "string",
  "amount": "string",
  "assetCode": "string (optional)",
  "assetIssuer": "string (optional)"
}
```

### XRPL

#### Create Wallet
```
POST /api/xrpl/wallet/create
```

#### Get Balance
```
GET /api/xrpl/balance/:address
```

### Bridge

#### Transfer Between Networks
```
POST /api/bridge/transfer
Body: {
  "sourceAddress": "string",
  "destinationAddress": "string",
  "amount": "string",
  "direction": "stellar-to-xrpl | xrpl-to-stellar"
}
```

#### Check Transfer Status
```
GET /api/bridge/status/:transactionId
```

## 🏗️ Project Structure

```
digital-giant-stellar/
├── src/
│   ├── config/          # Configuration management
│   ├── services/        # Business logic services
│   │   ├── stellar.service.ts
│   │   ├── xrpl.service.ts
│   │   └── bridge.service.ts
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middlewares
│   ├── utils/           # Utilities and helpers
│   ├── app.ts           # Express app setup
│   └── index.ts         # Application entry point
├── database/            # Database schemas
├── docker-compose.yml   # Docker orchestration
├── Dockerfile           # Container definition
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🔒 Security

- All API endpoints are rate-limited
- Input validation using Joi schemas
- Helmet.js for HTTP security headers
- CORS configuration
- Environment-based secrets management
- Never commit `.env` files

## 🐳 Docker Services

- **api**: Main application server
- **postgres**: Database for persistent storage
- **redis**: Caching and session management
- **nginx**: Reverse proxy (optional)

## 📊 Monitoring

Health check endpoint available at:
```
GET http://localhost:3000/health
```

Metrics endpoint (when enabled):
```
GET http://localhost:9090/metrics
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

Apache License 2.0 - See LICENSE file for details

## 🔗 Related Projects

- [Stellar Core](https://github.com/stellar/stellar-core)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [XRPL.js](https://github.com/XRPLF/xrpl.js)

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@digitalgiant.com

## 🚧 Roadmap

- [ ] Smart contract support
- [ ] Multi-signature transactions
- [ ] Advanced bridge routing
- [ ] WebSocket API
- [ ] Mobile SDK
- [ ] Enhanced monitoring dashboard

---

**Digital Giant Stellar Infrastructure** - Building the future of cross-chain blockchain connectivity
