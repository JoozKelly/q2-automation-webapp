---
name: gsk-crawler
version: 1.0.0
description: Crawl and extract content from web pages. Supports HTML, PDF, and documents.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk crawl --help
---

# gsk-crawler

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Crawl and extract content from web pages. Supports HTML, PDF, and documents.

## Usage

```bash
gsk crawl [options]
```

**Aliases:** `crawl`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<url>` (positional) | Yes | http/https url (string) |
| `--render_js` | No | Enable JavaScript rendering to bypass anti-bot protection (Cloudflare, 403 errors, dynamically loaded content). Use only when the site blocks plain HTTP crawlers or returns no content — this costs significantly more credits than the default crawler. Default: false. (boolean) |

## Local File Support

Parameters that accept URLs (`<url>`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
