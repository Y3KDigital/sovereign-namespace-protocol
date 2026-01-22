# Object Schema Definitions
## Universal Web3 Object Catalog

This directory contains canonical object definitions for all Web3 entities in the Y3K ecosystem.

Each object renders to the same **Protocol Console** interface across all surfaces (web, mobile, CLI, QR poster, NFC, etc.).

## Structure

```
objects/
  namespaces/          # Sovereign namespaces (777.y3k, 001.tron)
  chains/              # Blockchain objects (1.tron, 56.binance)
  vaults/              # Asset vaults (vault.777)
  agents/              # AI agents (agent.resolver)
  infrastructure/      # Core protocol objects
```

## Schema Format

Every object uses YAML with standard fields:

```yaml
object_type: namespace | chain | vault | agent | infrastructure
canonical_id: "777.y3k"
display_name: "Genesis Root 777"
description: "SOVEREIGN NAMESPACE • Genesis Root"

authority:
  entity: "Y3K Protocol"
  context: "Genesis Root Lock"
  verification: verified

qr:
  protocol: "y3k"
  payload: "y3k://777"
  fallback_url: "https://y3k.xyz/777"
  encoding: protocol-native

actions:
  - id: send_payment
    label: "Send Payment"
    enabled: true

state:
  - label: "Supply"
    value: 900
```

## Renderer

All objects render with: `<ProtocolConsole object={schema} />`

See: [PROTOCOL_CONSOLE_IMPLEMENTATION.md](../PROTOCOL_CONSOLE_IMPLEMENTATION.md)

## Validation

Every object must pass:
1. One screen test
2. QR-first test
3. Max 5 actions test
4. No marketing stats test
5. QR poster test

## Adding New Objects

1. Create YAML file in appropriate directory
2. Validate schema with `npm run validate-object [id]`
3. Test render on multiple surfaces
4. Deploy

**One definition. Infinite renderers.**
