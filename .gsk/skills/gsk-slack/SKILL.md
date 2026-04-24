---
name: gsk-slack
version: 1.0.0
description: 'Slack messaging operations. Actions: send, search, lookup.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk slack --help
---

# gsk-slack

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Slack messaging operations. Actions: send, search, lookup.

## Usage

```bash
gsk slack [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'send': Send a message to a channel or user; 'search': Search messages by keyword; 'lookup': Look up users, channels, or groups (string, one of: send, search, lookup) |
| `--message` | No | [send] The message content to send. Supports Slack markdown formatting. (string) |
| `--recipient` | No | [send] Optional recipient: 'self' (default), channel ID (e.g., 'C01234567'), or user ID (e.g., 'U01234567'). If not specified, sends to yourself. (string) |
| `--title` | No | [send] Optional title for the message. If provided, creates a rich formatted message with a header. (string) |
| `--fields` | No | [send] Optional array of field objects with 'title' and 'value' keys to create a structured message layout. (array) |
| `--thread_ts` | No | [send] Optional thread timestamp to reply in a thread. (string) |
| `--query` | No | [search] The search query. You can use modifiers like 'in:#channel', 'from:@user', 'has:link', 'before:yyyy-mm-dd'. (string) |
| `--count` | No | [search] The maximum number of messages to return. Default is 100. (integer) |
| `--sort` | No | [search] Sort order of results. 'score' for relevance or 'timestamp' for time. Default is 'score'. (string) |
| `--question` | No | [search] A specific question to answer based on the search results. (string) |
| `--lookup_type` | No | [lookup] What to look up: 'users' for team members, 'channels' for channels/conversations, 'all' for both. (string, one of: users, channels, all) |
| `--search_query` | No | [lookup] Optional search query to filter results by name. Case-insensitive partial match on name, display name, or real name. (string) |
| `--include_bots` | No | [lookup] Whether to include bot users in results. Default: false (boolean) |
| `--limit` | No | [lookup] Maximum number of results to return. Default: 50 (integer) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
