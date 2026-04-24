---
name: gsk-image-search
version: 1.0.0
description: Search for images on the web. Returns image URLs, titles, and source
  information.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk img-search --help
---

# gsk-image-search

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Search for images on the web. Returns image URLs, titles, and source information.

## Usage

```bash
gsk img-search [options]
```

**Aliases:** `img-search`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<query>` (positional) | Yes | The specific image search terms (e.g., 'Eiffel Tower at sunset', 'Bengal tiger in the wild'). (string) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
