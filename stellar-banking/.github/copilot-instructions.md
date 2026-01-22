# Digital Giant Stellar Infrastructure - Copilot Instructions

## Project Overview
This project is a fork of Stellar's open-source blockchain infrastructure, optimized for lightweight deployment and integrated with XRPL (XRP Ledger) platform capabilities.

## Architecture
- **Microservices-based** TypeScript/Node.js backend
- **Cross-chain bridge** connecting Stellar and XRPL networks
- **Containerized** services using Docker
- **RESTful API** with WebSocket support

## Development Guidelines
- Use TypeScript strict mode
- Follow functional programming patterns where possible
- Implement proper error handling with custom error classes
- Use async/await for asynchronous operations
- Add comprehensive logging for all services

## Code Style
- Use ESLint and Prettier for code formatting
- Prefer const over let, avoid var
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused (single responsibility)

## Testing
- Write unit tests for all services
- Use Jest as testing framework
- Maintain >80% code coverage
- Test error scenarios and edge cases

## Security
- Never commit sensitive data (keys, passwords)
- Use environment variables for configuration
- Validate all API inputs
- Implement rate limiting
- Use HTTPS for all external communications
