---
name: gsk-analyze-media
version: 1.0.0
description: Analyze various types of media content including images, audio, and video.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk media-analyze --help
---

# gsk-analyze-media

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Analyze various types of media content including images, audio, and video.

## Usage

```bash
gsk media-analyze [options]
```

**Aliases:** `media-analyze`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `-i`, `--media_urls` | Yes | List of media file URLs or AI Drive paths to analyze (array) |
| `--video_metadata` | No | Video-specific metadata for analysis (optional)Unless the user requires, it is not required to provide (object) |
| `-r`, `--requirements` | No | Must in English, Detailed analysis requirements and goals. Please clearly describe: - What is the purpose of the analysis? - What information needs to be extracted from the media? - What information is most important to you? - How will these analysis results be used? - What are the clips that can be extracted from the video? What are their corresponding time ranges (in milliseconds) and descriptions? - ... (You can add more requirements here) - Specific requirements for different media types (images, audio, video)  For example: 'I need to analyze these materials for emotional tone, main content, use cases for a marketing campaign, other requirements...'  Note: This parameter is ignored when analyze_type='video_style_replication'. (string) |
| `--analyze_type` | No | Type of analysis to perform. Options: - '' (empty/default): Standard content analysis based on requirements - 'video_style_replication': Analyze video's cinematography style, expression techniques, and production methods to enable replicating its visual language in new content. When this type is used, a specialized prompt guides the analysis to extract filmmaking craft, aesthetic decisions, and technical approaches that define the video's unique character. The output is suitable for guiding AI video generation systems to replicate similar styles. (string, one of: , video_style_replication) |

## Local File Support

Parameters that accept URLs (`--media_urls`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
