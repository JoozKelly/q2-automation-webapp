---
name: gsk-phone-call
version: 1.0.0
description: Make an AI phone call on your behalf. Validates user prerequisites (membership,
  phone setup, credits) and resolves contact information. For business contacts, looks
  up Google Maps place data. For personal contacts, validates and normalizes the phone
  number.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk phone-call --help
---

# gsk-phone-call

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Make an AI phone call on your behalf. Validates user prerequisites (membership, phone setup, credits) and resolves contact information. For business contacts, looks up Google Maps place data. For personal contacts, validates and normalizes the phone number.

## Usage

```bash
gsk phone-call [options]
```

**Aliases:** `phone-call`, `call-for-me`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<recipient>` (positional) | Yes | The name of the person or business to call. Examples: - Personal: 'John Smith', 'Dr. Sarah Johnson' - Business: 'Starbucks George Street', 'Hilton Hotel Downtown' (string) |
| `-c`, `--contact_info` | Yes | Contact information - either a Google Maps place_id OR a phone number:  **For businesses (is_place_id=true):** - Provide Google Maps place_id (e.g., 'ChIJcawkWTyuEmsRG56o5LAc0LQ') - Must be obtained from previous maps_search results - NEVER fabricate or guess place_id values  **For personal contacts (is_place_id=false):** - Provide phone number with international country code - Format: '+1-555-123-4567' (US), '+44-20-1234-5678' (UK) - If no country code, defaults to US (+1) - MUST have verified data lineage from: (1) user-provided info, (2) previous tool results, or (3) explicit context - NEVER fabricate, generate, estimate, or infer phone numbers (string) |
| `--is_place_id` | Yes | Indicates the type of contact_info provided: - true: contact_info is a Google Maps place_id (business) - false: contact_info is a phone number (personal contact) (boolean) |
| `-p`, `--purpose` | Yes | The clear reason for making the call (e.g., 'Check reservation availability', 'Inquire about business hours'). (string) |

> **CAUTION:** This command performs a write/send operation. Double-check parameters before executing.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
