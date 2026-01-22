# Y3K Resolver CLI

Command-line tool for managing your Y3K .x namespaces.

## Installation

```bash
npm install -g @y3k/resolver-cli
```

Or run locally:
```bash
cd y3k-resolver-cli
npm install
npm link
```

## Quick Start

### 1. Login with your private key

```bash
y3k-resolver login --key ./brad-PRIVATE-KEY-BACKUP.json
```

### 2. Check your status

```bash
y3k-resolver status
```

### 3. Set resolver records

```bash
# Point your namespace to a website
y3k-resolver set brad.x --website https://yoursite.com

# Add your Ethereum address
y3k-resolver set brad.x --eth 0xYourWalletAddress

# Add IPFS content
y3k-resolver set brad.x --ipfs QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxX

# Add social profiles
y3k-resolver set brad.x --twitter @yourhandle --github yourusername
```

### 4. Create subdomains

```bash
# Create a subdomain pointing to IPFS
y3k-resolver subdomain create blog.brad.x --ipfs QmBlogCID

# Create subdomain for your NFT gallery
y3k-resolver subdomain create nft.brad.x --website https://gallery.com

# Create payment endpoint
y3k-resolver subdomain create pay.brad.x --eth 0xYourWallet
```

### 5. List your subdomains

```bash
y3k-resolver list
```

### 6. Query any namespace

```bash
y3k-resolver get donald.x
y3k-resolver get 77.x
```

## Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate with your private key |
| `status` | Show current authentication status |
| `set <namespace>` | Set resolver records (website, eth, ipfs, etc.) |
| `get <namespace>` | Get resolver records for any namespace |
| `subdomain create <name>` | Create a subdomain |
| `list` | List all your subdomains |
| `keys` | Show your public key information |

## Examples

### Full Website Setup

```bash
# Login
y3k-resolver login --key ./my-key-backup.json

# Set main resolver
y3k-resolver set brad.x \
  --website https://brad.com \
  --eth 0x1234... \
  --twitter @bradsmith \
  --github bradsmith

# Create subdomains
y3k-resolver subdomain create blog.brad.x --website https://blog.brad.com
y3k-resolver subdomain create nft.brad.x --website https://opensea.io/bradsmith
y3k-resolver subdomain create pay.brad.x --eth 0x1234...
```

### IPFS-Only Setup

```bash
# Point to decentralized content
y3k-resolver set brad.x --ipfs QmMainSiteCID

# Subdomains on IPFS
y3k-resolver subdomain create docs.brad.x --ipfs QmDocsCID
y3k-resolver subdomain create app.brad.x --ipfs QmAppCID
```

## Configuration

Config file location: `~/.y3k/config.json`

Contains:
- Your namespace
- Your public key
- Active session

**⚠️ Never commit your private key backup file to git!**

## Next Steps

- Set up resolver records
- Create subdomains for your projects
- Integrate with your website
- Use as Web3 identity in MetaMask

## Support

- Docs: https://docs.y3kmarkets.com
- Discord: https://discord.gg/y3kmarkets
- Email: support@y3kdigital.com
