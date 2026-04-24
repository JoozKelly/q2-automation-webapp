---
name: gsk-social-reddit
version: 1.0.0
description: 'Search and retrieve data from Reddit: posts, comments, users, and subreddits.'
metadata:
  category: social
  requires:
    bins:
    - gsk
  cliHelp: gsk social reddit --help
---

# gsk-social-reddit

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Search and retrieve data from Reddit: posts, comments, users, and subreddits.

## Usage

```bash
gsk social reddit [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | The action to perform. (string, one of: search_posts, search_comments, search_users, search_subreddits, get_post_with_comments, get_subreddit_with_posts, get_subreddits_by_keywords, get_user, get_users_by_keywords) |
| `-q`, `--query` | No | Search query string. Used by: search_posts, search_comments, search_users (as name), search_subreddits, get_subreddits_by_keywords, get_user (as username), get_users_by_keywords, get_subreddit_with_posts (as subreddit name), get_post_with_comments (as post_id). (string) |
| `-p`, `--post_id` | No | Post ID. Used by: get_post_with_comments. (string) |
| `-s`, `--subreddit` | No | Subreddit name filter for search_posts, search_comments, get_users_by_keywords. (string) |
| `--sort` | No | Sort order for search_posts. (string, one of: relevance, hot, top, new, comments) |
| `--time` | No | Time filter for search_posts. (string, one of: hour, day, week, month, year, all) |
| `--start_date` | No | Start date filter (YYYY-MM-DD). (string) |
| `--end_date` | No | End date filter (YYYY-MM-DD). (string) |
| `--limit` | No | Max number of results (for search_users, search_subreddits). (integer) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
