---
name: gsk-google-drive
version: 1.0.0
description: 'Google Drive file operations. Actions: search, read, upload.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk gdrive --help
---

# gsk-google-drive

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Google Drive file operations. Actions: search, read, upload.

## Usage

```bash
gsk gdrive [options]
```

**Aliases:** `gdrive`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'search': Search files by name, type, or owner; 'read': Read and extract content from a file; 'upload': Upload a file to Google Drive (string, one of: search, read, upload) |
| `--query` | No | [search] Use keywords simply, terms will be combined into advanced search query in the later process.For example, if user ask for 'tax related documents', just use 'tax' as the query,DO NOT use advanced search query like 'name contains 'tax'' or 'fullText contains 'tax''. (string) |
| `--mime_type` | No | [search] Filter by MIME type for 'search' (e.g., 'application/pdf'). \| [upload] The MIME type of the file (optional, will be auto-detected from file_name extension). Examples: 'text/plain', 'text/csv', 'application/json', 'image/png'. (string) |
| `--owner` | No | [search] Filter by file owner (email address) for 'search' action (string) |
| `--folder_id` | No | [search] Search within a specific folder for 'search' action \| [upload] Google Drive folder ID to upload to. Optional, uploads to root if not specified. (string) |
| `--trashed` | No | [search] Include trashed files in search results for 'search' action (boolean) |
| `--file_id` | No | [read] The ID of the file to read from Google Drive. (string) |
| `--question` | No | [read] The question to answer about the file content. (string) |
| `--content` | No | [upload] Text content to create as a file. Use this for creating text-based files (e.g., .txt, .md, .csv, .json, .html). Either 'content' or 'file_path' is required. (string) |
| `--file_path` | No | [upload] Local file path to upload. Either 'content' or 'file_path' is required. (string) |
| `--file_name` | No | [upload] File name in Google Drive (include extension, e.g., 'report.txt'). MIME type will be auto-detected from extension if not specified. (string) |
| `--convert_to_google_format` | No | [upload] Whether to convert to Google Workspace format (e.g., .docx → Google Docs, .xlsx → Google Sheets, .pptx → Google Slides). Default: false (boolean, default: `False`) |
| `--share_publicly` | No | [upload] Whether to share the file publicly for viewing. Default: false (boolean, default: `False`) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
