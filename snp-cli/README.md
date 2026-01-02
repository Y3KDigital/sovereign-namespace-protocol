# snp-cli

**Sovereign Namespace Protocol - Command Line Interface**

User-facing CLI tool for SNP operations: namespace creation, identity management, certificate issuance, and vault derivation.

## Purpose

`snp-cli` (binary: `snp`) provides a complete command-line interface for interacting with the Sovereign Namespace Protocol. It wraps the `snp-core` library with user-friendly commands and JSON file management.

## Installation

```bash
cargo build --release -p snp-cli
```

Binary: `target/release/snp.exe` (Windows) or `target/release/snp` (Unix)

## Commands

### 1. Key Generation

Generate Dilithium5 post-quantum keypairs.

```bash
snp keygen generate \
  --seed "your-entropy-seed" \
  --pubkey pubkey.json \
  --seckey seckey.json
```

**Output**:
- `pubkey.json` - Public key (2,592 bytes, shareable)
- `seckey.json` - Secret key (4,896 bytes, keep secure!)

**Example**:
```bash
snp keygen generate \
  --seed "my-secure-entropy-2026" \
  --pubkey alice-pub.json \
  --seckey alice-sec.json
```

```
🔑 Generating Dilithium5 keypair...
✅ Keypair generated successfully!
  Public key size: 2592 bytes
  Secret key size: 4896 bytes
  Public key saved to: alice-pub.json
  Secret key saved to: alice-sec.json

⚠️  WARNING: Keep your secret key secure!
```

### 2. Namespace Operations

#### Create Namespace

Derive a new namespace from genesis hash.

```bash
snp namespace create \
  --genesis <GENESIS_HASH> \
  --label "your.namespace" \
  --sovereignty <CLASS> \
  --output namespace.json
```

**Sovereignty Classes**:
- `immutable` - Never changes, never transfers
- `transferable` - One-way ownership transfer
- `delegable` - M-of-N multisig authority
- `heritable` - Succession rules
- `sealed` - Cryptographically frozen

**Example**:
```bash
snp namespace create \
  --genesis "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc" \
  --label "acme.corp" \
  --sovereignty transferable \
  --output acme-namespace.json
```

```
📋 Creating namespace...
✅ Namespace created successfully!
  Label: acme.corp
  ID: 0xd555e3fac909e301a47cbe31fd9a199656428...
  Sovereignty: Transferable
  Genesis: 0x6787f9320ad087315948d2b60c210c674dc...
  Saved to: acme-namespace.json
```

#### Verify Namespace

Verify namespace derivation is correct.

```bash
snp namespace verify --file namespace.json
```

**Example**:
```bash
snp namespace verify --file acme-namespace.json
```

```
🔍 Verifying namespace...
✅ Namespace verified successfully!
  Label: acme.corp
  ID: 0xd555e3fac909e301a47cbe31fd9a199656428...
  Sovereignty: Transferable
```

### 3. Identity Operations

#### Create Identity

Derive an identity bound to a namespace with a public key.

```bash
snp identity create \
  --namespace namespace.json \
  --subject "user@example.com" \
  --pubkey pubkey.json \
  --output identity.json
```

**Example**:
```bash
snp identity create \
  --namespace acme-namespace.json \
  --subject "admin@acme.corp" \
  --pubkey alice-pub.json \
  --output alice-identity.json
```

```
👤 Creating identity...
✅ Identity created successfully!
  Subject: admin@acme.corp
  ID: 0xe41cac187a95e493d0ac0cdd1fd23ec748bad...
  Namespace: 0xd555e3fac909e301a47cbe31fd9a199656...
  Saved to: alice-identity.json
```

#### Verify Identity

Verify identity is correctly bound to namespace.

```bash
snp identity verify \
  --file identity.json \
  --namespace namespace.json
```

**Example**:
```bash
snp identity verify \
  --file alice-identity.json \
  --namespace acme-namespace.json
```

```
🔍 Verifying identity...
✅ Identity verified successfully!
  Subject: admin@acme.corp
  ID: 0xe41cac187a95e493d0ac0cdd1fd23ec748bad...
  Namespace: 0xd555e3fac909e301a47cbe31fd9a199656...
```

### 4. Certificate Operations

#### Issue Certificate

Generate a signed certificate for an identity.

```bash
snp certificate issue \
  --identity identity.json \
  --namespace namespace.json \
  --seckey seckey.json \
  --claims <CLAIMS_ROOT_HASH> \
  --issued_at <TIMESTAMP> \
  --expires_at <TIMESTAMP> \
  --output certificate.json
```

**Parameters**:
- `--claims` - Hash of certificate claims (32-byte hex)
- `--issued_at` - Unix timestamp (0 = now)
- `--expires_at` - Unix timestamp (0 = never expires)

**Example**:
```bash
snp certificate issue \
  --identity alice-identity.json \
  --namespace acme-namespace.json \
  --seckey alice-sec.json \
  --claims "0x0000000000000000000000000000000000000000000000000000000000000001" \
  --output alice-cert.json
```

```
📜 Issuing certificate...
✅ Certificate issued successfully!
  Subject: 0xe41cac187a95e493d0ac0cdd1fd23ec748...
  Namespace: 0xd555e3fac909e301a47cbe31fd9a199656...
  Issued at: 1767359782
  Expires at: Never
  Content hash: 0xb4d8827e5c1cbfec1c89a4566fc6212d44...
  Saved to: alice-cert.json
```

#### Verify Certificate

Verify certificate signature and temporal validity.

```bash
snp certificate verify \
  --file certificate.json \
  --identity identity.json \
  --current_time <TIMESTAMP>
```

**Parameters**:
- `--current_time` - Unix timestamp for validity check (0 = now)

**Example**:
```bash
snp certificate verify \
  --file alice-cert.json \
  --identity alice-identity.json
```

```
🔍 Verifying certificate...
Certificate Status:
  Signature: ✅ VALID
  Temporal validity: ✅ VALID
  Subject: 0xe41cac187a95e493d0ac0cdd1fd23ec748...
  Issued at: 1767359782
  Expires at: Never
  Current time: 1767359800

✅ Certificate is VALID
```

### 5. Vault Operations

#### Derive Vault

Derive a deterministic vault address.

```bash
snp vault derive \
  --namespace namespace.json \
  --asset <ASSET_HASH> \
  --policy <POLICY_HASH> \
  --index <INDEX> \
  --output vault.json
```

**Parameters**:
- `--asset` - Asset fingerprint hash (32-byte hex)
- `--policy` - Policy rules hash (32-byte hex)
- `--index` - Derivation index (0, 1, 2, ...)

**Example**:
```bash
snp vault derive \
  --namespace acme-namespace.json \
  --asset "0x0000000000000000000000000000000000000000000000000000000000000001" \
  --policy "0x0000000000000000000000000000000000000000000000000000000000000002" \
  --index 0 \
  --output acme-vault-0.json
```

```
🏦 Deriving vault...
✅ Vault derived successfully!
  Vault ID: 0xfbb358978562c521c15918c3621283a38b...
  Namespace: 0xd555e3fac909e301a47cbe31fd9a199656...
  Asset hash: 0x00000000000000000000000000000000000...
  Policy hash: 0x0000000000000000000000000000000000...
  Index: 0
  Saved to: acme-vault-0.json
```

#### Verify Vault

Verify vault derivation is correct.

```bash
snp vault verify \
  --file vault.json \
  --namespace namespace.json
```

**Example**:
```bash
snp vault verify \
  --file acme-vault-0.json \
  --namespace acme-namespace.json
```

```
🔍 Verifying vault...
✅ Vault verified successfully!
  Vault ID: 0xfbb358978562c521c15918c3621283a38b...
  Namespace: 0xd555e3fac909e301a47cbe31fd9a199656...
  Index: 0
```

## Complete Workflow Example

```bash
# 1. Generate keypair
snp keygen generate \
  --seed "alice-entropy-2026" \
  --pubkey alice-pub.json \
  --seckey alice-sec.json

# 2. Create namespace (using genesis from snp-genesis-cli)
snp namespace create \
  --genesis "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc" \
  --label "acme.corp" \
  --sovereignty transferable \
  --output acme-namespace.json

# 3. Create identity
snp identity create \
  --namespace acme-namespace.json \
  --subject "admin@acme.corp" \
  --pubkey alice-pub.json \
  --output alice-identity.json

# 4. Issue certificate
snp certificate issue \
  --identity alice-identity.json \
  --namespace acme-namespace.json \
  --seckey alice-sec.json \
  --claims "0x0000000000000000000000000000000000000000000000000000000000000001" \
  --output alice-cert.json

# 5. Verify certificate
snp certificate verify \
  --file alice-cert.json \
  --identity alice-identity.json

# 6. Derive vault
snp vault derive \
  --namespace acme-namespace.json \
  --asset "0x0000000000000000000000000000000000000000000000000000000000000001" \
  --policy "0x0000000000000000000000000000000000000000000000000000000000000002" \
  --index 0 \
  --output acme-vault.json
```

## File Formats

All files are JSON format with hex-encoded binary data.

### Namespace File
```json
{
  "id": "0xd555e3fac909e301a47cbe31fd9a199656428...",
  "label": "acme.corp",
  "sovereignty": "Transferable",
  "genesis_hash": "0x6787f9320ad087315948d2b60c210c674..."
}
```

### Identity File
```json
{
  "id": "0xe41cac187a95e493d0ac0cdd1fd23ec748bad...",
  "namespace_id": "0xd555e3fac909e301a47cbe31fd9a199656...",
  "subject": "admin@acme.corp",
  "public_key": {
    "bytes": "..."
  }
}
```

### Certificate File
```json
{
  "subject": "0xe41cac187a95e493d0ac0cdd1fd23ec748...",
  "namespace": "0xd555e3fac909e301a47cbe31fd9a199656...",
  "claims_root": "0x000000000000000000000000000000000...",
  "issued_at": 1767359782,
  "expires_at": 0,
  "signature": {
    "bytes": "..."
  }
}
```

## Integration with Other Tools

### Using with snp-genesis-cli

```bash
# 1. Run genesis ceremony
snp-genesis run-mock --output genesis.json

# 2. Extract genesis hash
GENESIS_HASH=$(jq -r '.genesis_hash' genesis.json)

# 3. Use in namespace creation
snp namespace create --genesis "$GENESIS_HASH" --label "my.namespace" ...
```

### Using with snp-verifier

```bash
# 1. Issue certificate with snp-cli
snp certificate issue ... --output cert.json

# 2. Verify with snp-verifier
snp-verify verify --certificate cert.json --genesis "$GENESIS_HASH"
```

## Error Handling

All errors are displayed with context:

```bash
$ snp namespace create --genesis "invalid" --label "test" --sovereignty immutable --output test.json

Error: Invalid genesis hash
```

Exit codes:
- `0` - Success
- `1` - Error occurred

## Features

- ✅ **Genesis-bound** - All operations tied to genesis hash
- ✅ **Post-quantum** - Dilithium5 key generation and signatures
- ✅ **Deterministic** - All IDs are cryptographically derived
- ✅ **Offline** - No network or blockchain required
- ✅ **Verifiable** - All outputs can be independently verified
- ✅ **JSON format** - Easy integration with other tools
- ✅ **Colored output** - Clear visual feedback

## Dependencies

```toml
snp-core = { path = "../snp-core" }  # Core library
clap = "4.5"                         # CLI framework
anyhow = "1.0"                       # Error handling
serde = "1.0"                        # JSON serialization
colored = "2.1"                      # Terminal colors
```

## Performance

- **Keygen**: ~5ms
- **Namespace create**: <1ms
- **Identity create**: <1ms
- **Certificate issue**: ~10ms
- **Vault derive**: <1ms
- **All verify operations**: <5ms

## Security Considerations

### Secret Key Management

⚠️ **Secret keys are saved to files unencrypted**

For production use:
- Use hardware security modules (HSM)
- Encrypt secret key files
- Use secure key derivation
- Implement key rotation

### Genesis Hash

The genesis hash is the root of all trust. Verify it matches the official ceremony output:

```bash
# From official ceremony
OFFICIAL_GENESIS="0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc"

# Your namespace
YOUR_GENESIS=$(jq -r '.genesis_hash' namespace.json)

# Verify match
[ "$OFFICIAL_GENESIS" = "$YOUR_GENESIS" ] && echo "✅ Genesis verified"
```

## Specification Conformance

`snp-cli` wraps `snp-core` which conforms to:

- ✅ **NAMESPACE_OBJECT.md** - Namespace derivation
- ✅ **SOVEREIGNTY_CLASSES.md** - 5 sovereignty models
- ✅ **CRYPTO_PROFILE.md** - Dilithium5 + SHA3-256
- ✅ **VAULT_MODEL.md** - Vault derivation
- ✅ **GENESIS_SPEC.md** - Genesis binding

## Version

1.0.0

## Related Components

- [snp-core](../snp-core/) - Foundational library
- [snp-genesis-cli](../snp-genesis-cli/) - Genesis ceremony tooling
- [snp-verifier](../snp-verifier/) - Stateless verification
- Specifications: https://github.com/Y3KDigital/sovereign-namespace-protocol
