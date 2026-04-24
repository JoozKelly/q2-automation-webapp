---
name: gsk-aidrive
version: 1.0.0
description: 'AI-Drive file storage and management. Actions: ls, mkdir, rm, move,
  get_readable_url, download_video, download_audio, download_file, upload.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk drive --help
---

# gsk-aidrive

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

AI-Drive file storage and management. Actions: ls, mkdir, rm, move, get_readable_url, download_video, download_audio, download_file, upload.

## Usage

```bash
gsk drive [options]
```

**Aliases:** `drive`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform (string, one of: ls, mkdir, rm, move, get_readable_url, download_video, download_audio, download_file, upload) |
| `-p`, `--path` | No | Path to file or folder for actions: ls, mkdir, rm, move, get_readable_url. For compress: folder path to compress. For decompress: archive file path to decompress (string) |
| `-f`, `--filter_type` | No | Filter by entry type for ls action (improves performance): all (default), file, directory. Use 'file' when only need files. (string, one of: all, file, directory) |
| `--file_type` | No | Filter by file MIME type for ls action (improves performance): all (default), audio, video, image. Combine with filter_type='file' for best results. (string, one of: all, audio, video, image) |
| `--target_path` | No | Destination path, for move action only (string) |
| `--target_folder` | No | Destination folder, for download_video, download_audio and download_file actions (string) |
| `--video_url` | No | URL of video to download, for download_video action (string) |
| `--audio_url` | No | URL of audio/video to download audio from, for download_audio action (string) |
| `--file_url` | No | URL of file to download, for download_file action (string) |
| `--file_name` | No | User-friendly filename with appropriate extension (e.g. annual_report.pdf) for download_file action. If not provided, system will auto-generate filename (string) |
| `--file_content` | No | Content to upload to AI Drive. Can be plain text or base64-encoded binary data. For text files (txt, md, json, csv, etc.), provide plain text content. For binary files, provide base64-encoded content with 'base64:' prefix. Size limit: 1MB without confirmation, 5MB absolute maximum. (string) |
| `--upload_path` | No | Target path for upload action (must start with '/' and include filename). **Path Organization Best Practice**: Use /<workflow_name>/<YYYY-MM-DD_HHMMSS>/<filename> to organize outputs by workflow and execution time, preventing overwrites. Example: /Daily_Report_Workflow/2024-01-15_093000/analysis.md. Create parent directories with mkdir action first if they don't exist. (string) |
| `--content_type` | No | MIME type of the content. If not provided, will be auto-detected from filename. Common types: text/plain, text/markdown, application/json, text/csv (string) |
| `--confirmed` | No | Set to true to confirm upload when: (1) file size > 1MB, or (2) content contains potentially sensitive patterns. If confirmation is required but not provided, upload will fail with a warning. (boolean) |

## Local File Support

Parameters that accept URLs (`--video_url`, `--audio_url`, `--file_url`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
