---
name: gsk-social-twitter
version: 1.0.0
description: 'Search and retrieve data from Twitter/X: posts, users, comments, retweets,
  and more.'
metadata:
  category: social
  requires:
    bins:
    - gsk
  cliHelp: gsk social twitter --help
---

# gsk-social-twitter

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Search and retrieve data from Twitter/X: posts, users, comments, retweets, and more.

## Usage

```bash
gsk social twitter [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | The action to perform. (string, one of: search_posts, search_users, get_posts_by_author, get_posts_by_ids, get_user, get_user_connections, get_users_by_keywords, get_comments, get_quotes, get_retweets, get_post_interacting_users, count_posts) |
| `-q`, `--query` | No | Search query string. Used by: search_posts, search_users (as name), get_users_by_keywords, get_posts_by_author (as identifier/handle), get_user (as identifier/username), count_posts (as phrase). (string) |
| `-p`, `--post_id` | No | Tweet/post ID. Used by: get_comments, get_quotes, get_retweets, get_post_interacting_users. (string) |
| `--post_ids` | No | Comma-separated tweet IDs. Used by: get_posts_by_ids. (string) |
| `--connection_type` | No | Connection type for get_user_connections. (string, one of: followers, following) |
| `--interaction_type` | No | Interaction type for get_post_interacting_users. (string, one of: commenters, quoters, retweeters) |
| `--start_date` | No | Start date filter (YYYY-MM-DD). (string) |
| `--end_date` | No | End date filter (YYYY-MM-DD). (string) |
| `--language` | No | Language filter (e.g. 'en', 'zh'). (string) |
| `--limit` | No | Max number of results (for search_users). (integer) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
