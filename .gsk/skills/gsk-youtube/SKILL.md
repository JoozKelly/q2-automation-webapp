---
name: gsk-youtube
version: 1.0.0
description: 'YouTube operations. Actions: search, transcript, comments.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk yt --help
---

# gsk-youtube

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

YouTube operations. Actions: search, transcript, comments.

## Usage

```bash
gsk yt [options]
```

**Aliases:** `yt`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'search': Search for YouTube videos by keyword; 'transcript': Extract transcript and metadata from a YouTube video; 'comments': Scrape comments from a YouTube video (string, one of: search, transcript, comments) |
| `--query` | No | [search] The query to search video (string) |
| `--video_id` | No | [transcript] The video id of the youtube video. (string) |
| `--provide_download_link` | No | [transcript] Whether to provide a download link for the video transcript. (boolean) |
| `--video_url` | No | [comments] YouTube video URL. Supports youtube.com/watch?v=, youtu.be/, and youtube.com/shorts/ formats. (string) |
| `--max_comments` | No | [comments] Maximum number of comments to fetch (default 100, max 500). Higher values take longer to scrape. (integer) |

## Local File Support

Parameters that accept URLs (`--video_url`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
