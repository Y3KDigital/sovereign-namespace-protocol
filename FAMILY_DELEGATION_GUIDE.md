# Family & Delegation Guide

**WARNING:** Adding a delegate gives them real power. Treat this like adding a signatory to a bank account.

## How to Add a Family Member

1. **Obtain their Identity**
   They must have a sovereign identity (e.g., `wife.x`) or a public key.

2. **Edit `os-config.json`**
   Add the `delegates` block to your configuration.

### Example Configuration

```json
{
  "identity": "brad.x",
  "phone": "+1-321-278-8323",
  "storage": { ... },
  "delegates": [
    {
      "delegate": "wife.x",
      "role": "Family",
      "permissions": [
        "ViewStatus",
        "ApprovePayments",
        "EmergencyTrigger"
      ],
      "constraints": {
        "daily_spend_limit": 500.0,
        "expires_at": null
      }
    }
  ]
}
```

## Roles & Capabilities

| Role | Intended Use | Default Capabilities |
|------|--------------|----------------------|
| **Family** | Spouse / Partner | Shared finances, full visibility. |
| **Emergency** | Lawyer / Trusted Friend | No daily access. Only "Break Glass". |
| **Observer** | Auditor / Child | View Status only. No actions. |

## The "Break Glass" Protocol (Emergency Mode)
If a delegate with `EmergencyTrigger` permission sends the trigger signal:
1. All remote access is severed immediately.
2. The Vault locks down (Unmounts).
3. A "Help Beacon" is broadcast to all other delegates.
4. Reboot requires the Root Key (Physical).

## Testing
Run `kevan-os status` to verify the delegate count.
```text
Delegates: 1 active
```
