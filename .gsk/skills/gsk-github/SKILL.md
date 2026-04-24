---
name: gsk-github
version: 1.0.0
description: 'GitHub operations. Actions: list_repos, search_issues, create_issue,
  update_issue.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk github --help
---

# gsk-github

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

GitHub operations. Actions: list_repos, search_issues, create_issue, update_issue.

## Usage

```bash
gsk github [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'list_repos': List repositories for the authenticated user; 'search_issues': Search issues and pull requests; 'create_issue': Create a new issue; 'update_issue': Update an existing issue (string, one of: list_repos, search_issues, create_issue, update_issue) |
| `--visibility` | No | [list_repos] Filter by repository visibility. Default: all. (string, one of: all, public, private) |
| `--affiliation` | No | [list_repos] Comma-separated list of affiliation types: owner, collaborator, organization_member. Default: owner,collaborator,organization_member. (string) |
| `--sort` | No | [list_repos] How to sort the results. Default: updated. \| [search_issues] How to sort results. Default: best match. (string, one of: created, updated, pushed, full_name) |
| `--direction` | No | [list_repos] Sort direction. Default: desc (except for full_name). (string, one of: asc, desc) |
| `--per_page` | No | [list_repos] Number of results per page (max 100). Default: 30. \| [search_issues] Number of results per page (max 100). Default: 30. (integer) |
| `--page` | No | [list_repos] Page number of the results. Default: 1. \| [search_issues] Page number of the results. Default: 1. (integer) |
| `--q` | No | [search_issues] Search query using GitHub search syntax. Examples: 'repo:owner/repo is:issue is:open', 'author:username', 'label:bug', 'state:closed' (string) |
| `--repo` | No | [search_issues] Repository in 'owner/repo' format to search within. Will be added to the query. \| [create_issue] The name of the repository (without the owner prefix). \| [update_issue] The name of the repository (without the owner prefix). (string) |
| `--state` | No | [search_issues] Filter by issue state. Will be added to the query. \| [update_issue] State of the issue. Use 'closed' to close the issue, 'open' to reopen it. (string, one of: open, closed, all) |
| `--labels` | No | [search_issues] Comma-separated list of labels to filter by. \| [create_issue] Labels to associate with this issue (e.g., ['bug', 'enhancement']). \| [update_issue] Labels to set on this issue (replaces existing labels). (string) |
| `--assignee` | No | [search_issues] Filter by assignee username. (string) |
| `--order` | No | [search_issues] Sort order. Default: desc. (string, one of: asc, desc) |
| `--owner` | No | [create_issue] The account owner of the repository (username or organization name). \| [update_issue] The account owner of the repository (username or organization name). (string) |
| `--title` | No | [create_issue] The title of the issue (required). \| [update_issue] New title of the issue. (string) |
| `--body` | No | [create_issue] The contents/description of the issue. Supports Markdown. \| [update_issue] New contents/description of the issue. Supports Markdown. (string) |
| `--assignees` | No | [create_issue] Logins/usernames of users to assign to this issue. \| [update_issue] Logins/usernames to assign to this issue (replaces existing assignees). (array) |
| `--milestone` | No | [create_issue] The milestone number to associate with this issue. \| [update_issue] The milestone number to associate with this issue. Set to null to remove milestone. (integer) |
| `--issue_number` | No | [update_issue] The number of the issue to update (required). (integer) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
