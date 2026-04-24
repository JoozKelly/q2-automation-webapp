---
name: gsk-google-docs
version: 1.0.0
description: 'Google Docs document operations. Actions: create, read, append, search.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk docs --help
---

# gsk-google-docs

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Google Docs document operations. Actions: create, read, append, search.

## Usage

```bash
gsk docs [options]
```

**Aliases:** `docs`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'create': Create a new document; 'read': Read content from a document; 'append': Append content to a document; 'search': Search documents by name (string, one of: create, read, append, search) |
| `--title` | No | [create] Title of the new document. (string) |
| `--content` | No | [create] Optional initial text content for the document. \| [append] The text content to append to the document. (string) |
| `--document_id` | No | [read] The ID of the document to read. \| [append] The ID of the document to append to. (string) |
| `--query` | No | [search] Search query to find documents by name or content. (string) |
| `--limit` | No | [search] Maximum number of results to return (1-50). Default: 10 (integer) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
