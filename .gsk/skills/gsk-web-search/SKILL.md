---
name: gsk-web-search
version: 1.0.0
description: Search the web. Returns search results with titles, snippets, and URLs.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk search --help
---

# gsk-web-search

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Search the web. Returns search results with titles, snippets, and URLs.

## Usage

```bash
gsk search [options]
```

**Aliases:** `search`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<q>` (positional) | Yes | User's search query (string) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
