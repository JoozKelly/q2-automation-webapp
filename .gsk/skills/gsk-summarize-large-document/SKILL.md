---
name: gsk-summarize-large-document
version: 1.0.0
description: Analyze and answer questions about large documents (PDFs, web pages,
  Word docs, etc.).
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk summarize --help
---

# gsk-summarize-large-document

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Analyze and answer questions about large documents (PDFs, web pages, Word docs, etc.).

## Usage

```bash
gsk summarize [options]
```

**Aliases:** `summarize`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<url>` (positional) | Yes | URL of the document to be fetched and analyzed (string) |
| `--question` | Yes | Specific question about the document content (string) |

## Local File Support

Parameters that accept URLs (`<url>`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
