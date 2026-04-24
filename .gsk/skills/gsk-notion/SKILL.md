---
name: gsk-notion
version: 1.0.0
description: 'Notion page operations. Actions: search, read, create.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk notion --help
---

# gsk-notion

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Notion page operations. Actions: search, read, create.

## Usage

```bash
gsk notion [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'search': Search pages and databases; 'read': Read content from a page; 'create': Create a new page (string, one of: search, read, create) |
| `--query` | No | [search] Query to search for in Notion pages. (string) |
| `--page_id` | No | [read] The ID of the Notion page to read and summarize. (string) |
| `--title` | No | [create] The title of the new page. (string) |
| `--content` | No | [create] The content of the page in markdown format. Supports headings, lists, code blocks, links, etc. (string) |
| `--parent_id` | No | [create] The ID of the parent page or database where the new page will be created. Use notion_search to find available pages/databases first. (string) |
| `--parent_type` | No | [create] The type of parent: 'page_id' for creating under a page, 'database_id' for creating in a database. Default is 'page_id'. (string, one of: page_id, database_id) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
