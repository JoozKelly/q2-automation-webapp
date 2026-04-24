---
name: gsk-sharepoint
version: 1.0.0
description: 'SharePoint site and file operations. Actions: list, search, read_content,
  read_file.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk sharepoint --help
---

# gsk-sharepoint

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

SharePoint site and file operations. Actions: list, search, read_content, read_file.

## Usage

```bash
gsk sharepoint [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'list': List files in a site or library; 'search': Search across sites; 'read_content': Read content from a list item or page; 'read_file': Read and extract content from a file (string, one of: list, search, read_content, read_file) |
| `--sharepoint_url` | No | [list] A SharePoint URL to list files from. Can be a site URL, document library URL (AllItems.aspx), or a folder URL. Example: 'https://company.sharepoint.com/sites/TeamSite/Shared Documents/Forms/AllItems.aspx' (string) |
| `--site_id` | No | [list] The SharePoint site ID. Use this to list the default document library of a specific site. Get site IDs from sharepoint_search results. \| [read_content] Site ID from SharePoint search results siteInfo. Required for listItem content type. (string) |
| `--drive_id` | No | [list] The document library (drive) ID. Use this to list files in a specific document library. (string) |
| `--folder_id` | No | [list] The folder item ID within a drive. Use this with drive_id to navigate into subfolders. Get folder IDs from previous sharepoint_list_files results. (string) |
| `--limit` | No | [list] Maximum number of items to return (1-200). Default: 50 (integer) |
| `--query` | No | [search] The search query string using KQL syntax. **Query Behavior**: • Spaces = AND: 'project report' finds items with BOTH terms • OR operator: 'project OR report' finds items with EITHER term • Empty string: '*' returns all items • Mixed language: automatically optimized (e.g., '项目 project' → '项目 OR project') • Examples: 'budget 2024', 'meeting OR conference', 'from:john project', 'hasAttachment:true report' (string) |
| `--entity_types` | No | [search] Types of SharePoint content to search. Defaults to all types. (array, default: `['site', 'listItem', 'list', 'driveItem']`) |
| `--content_id` | No | [read_content] The ID of the SharePoint content to read. Can be a site ID, page ID, list ID, list item ID from SharePoint search results, or a SharePoint URL for direct file access. For Teams attachments, use the 'content_id' value from Teams search results onedrive_file_params. (string) |
| `--content_type` | No | [read_content] The type of SharePoint content to read. Use 'driveItem' for SharePoint files, 'listItem' for SharePoint pages/list items. (string, one of: site, page, list, listItem, driveItem) |
| `--question` | No | [read_content] The question to answer about the SharePoint content. \| [read_file] The question to answer about the file content. (string) |
| `--list_id` | No | [read_content] List ID from SharePoint search results siteInfo. Required for listItem content type. (string) |
| `--list_item_id` | No | [read_content] List item ID from SharePoint search results siteInfo. Required for listItem content type. (string) |
| `--file_id` | No | [read_file] The ID of the file OR the SharePoint URL to read from Microsoft OneDrive/SharePoint/Teams. Can be either a file ID (like '01W56PINYRO3...') or a full SharePoint URL (like 'https://domain.sharepoint.com/...'). (string) |

## Local File Support

Parameters that accept URLs (`--sharepoint_url`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
