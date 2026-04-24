---
name: gsk-social-instagram
version: 1.0.0
description: 'Search and retrieve data from Instagram: posts, users, comments, and
  connections.'
metadata:
  category: social
  requires:
    bins:
    - gsk
  cliHelp: gsk social instagram --help
---

# gsk-social-instagram

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Search and retrieve data from Instagram: posts, users, comments, and connections.

## Usage

```bash
gsk social instagram [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | The action to perform. (string, one of: search_posts, search_users, get_posts_by_user, get_posts_by_ids, get_user, get_user_connections, get_users_by_keywords, get_comments, get_post_interacting_users) |
| `-q`, `--query` | No | Search query or username/identifier. Used by: search_posts, search_users (as name), get_posts_by_user (as identifier), get_user (as identifier), get_users_by_keywords. (string) |
| `-p`, `--post_id` | No | Post ID. Used by: get_comments, get_post_interacting_users. (string) |
| `--post_ids` | No | Comma-separated post IDs. Used by: get_posts_by_ids. (string) |
| `--connection_type` | No | Connection type for get_user_connections. (string, one of: followers, following) |
| `--interaction_type` | No | Interaction type for get_post_interacting_users. (string, one of: likers, commenters) |
| `--start_date` | No | Start date filter (YYYY-MM-DD). (string) |
| `--end_date` | No | End date filter (YYYY-MM-DD). (string) |
| `--limit` | No | Max number of results (for search_users). (integer) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
