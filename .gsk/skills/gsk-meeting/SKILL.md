---
name: gsk-meeting
version: 1.0.0
description: 'Meeting notes operations. Actions: list, search, get.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk meeting --help
---

# gsk-meeting

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Meeting notes operations. Actions: list, search, get.

## Usage

```bash
gsk meeting [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'list': List meeting notes by creation date; 'search': Search meeting notes by keyword; 'get': Get details of a specific meeting note (string, one of: list, search, get) |
| `--page_size` | No | [list] Number of results per page. Default: 20. Max: 50. \| [search] Number of results per page. Default: 20. Max: 50. (integer) |
| `--continuation_token` | No | [list] Token for fetching the next page of results. Returned from a previous list call. (string) |
| `--keyword` | No | [search] Search term to find in meeting notes. (string) |
| `--date_from` | No | [search] Filter meetings after this date (ISO format: YYYY-MM-DD). (string) |
| `--date_to` | No | [search] Filter meetings before this date (ISO format: YYYY-MM-DD). (string) |
| `--meeting_source` | No | [search] Filter by calendar source. (string, one of: google, outlook) |
| `--sort_by` | No | [search] Sort order. 'relevance' for best match first, 'created_at' for newest first (default). (string, one of: created_at, relevance) |
| `--page` | No | [search] Page number (0-indexed). Use with has_more to paginate results. Default: 0. (integer) |
| `--task_id` | No | [get] The ID of the meeting note to retrieve. (string) |
| `--detail_level` | No | [get] Level of detail to return. 'summary' = title + status + summary + user notes (default, saves tokens). 'full' = summary + complete transcription text. 'segments' = summary + segments with speaker labels. (string, one of: summary, full, segments) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
