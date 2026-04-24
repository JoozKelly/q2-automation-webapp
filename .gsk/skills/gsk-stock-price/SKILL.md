---
name: gsk-stock-price
version: 1.0.0
description: Retrieve real-time stock price information for a specific company.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk stock --help
---

# gsk-stock-price

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Retrieve real-time stock price information for a specific company.

## Usage

```bash
gsk stock [options]
```

**Aliases:** `stock`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<symbol>` (positional) | Yes | The stock ticker symbol of the company (e.g., 'AAPL' for Apple, 'MSFT' for Microsoft). (string) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
