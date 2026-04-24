---
name: gsk-onedrive
version: 1.0.0
description: 'OneDrive file operations. Actions: list, search, read.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk onedrive --help
---

# gsk-onedrive

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

OneDrive file operations. Actions: list, search, read.

## Usage

```bash
gsk onedrive [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'list': List files in a folder; 'search': Search files; 'read': Read and extract content from a file (string, one of: list, search, read) |
| `--onedrive_url` | No | [list] A OneDrive URL to list files from. Can be a sharing link, folder link, or any OneDrive URL. (string) |
| `--folder_id` | No | [list] The folder item ID to list contents of. Get folder IDs from previous onedrive_list_files or onedrive_search results. (string) |
| `--folder_path` | No | [list] The folder path relative to OneDrive root. Example: 'Documents/Projects' to list files in that subfolder. (string) |
| `--limit` | No | [list] Maximum number of items to return (1-200). Default: 50 (integer) |
| `--query` | No | [search] The search query string. **Query Behavior**: • Spaces = AND: 'project report' finds files with BOTH terms • OR operator: 'project OR report' finds files with EITHER term • Empty string: '*' lists all files • Wildcards: 'report*' finds files starting with 'report' • Examples: 'budget.xlsx', 'meeting OR conference', '*.pdf', 'project 2024' (string) |
| `--file_id` | No | [read] The ID of the file OR the OneDrive/SharePoint URL to read from OneDrive or SharePoint. Can be either a file ID (like '01W56PINYRO3...') or a full OneDrive/SharePoint URL (like 'https://domain-my.sharepoint.com/personal/user/Documents/file.pdf' or SharePoint driveItem IDs). For Teams attachments, use the 'file_id' value from Teams search results onedrive_file_params. (string) |
| `--question` | No | [read] The question to answer about the file content. (string) |

## Local File Support

Parameters that accept URLs (`--onedrive_url`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
