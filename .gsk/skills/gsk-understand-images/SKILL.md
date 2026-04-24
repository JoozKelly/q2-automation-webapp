---
name: gsk-understand-images
version: 1.0.0
description: Analyze and understand images. Supports multiple images and custom analysis
  instructions.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk analyze --help
---

# gsk-understand-images

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Analyze and understand images. Supports multiple images and custom analysis instructions.

## Usage

```bash
gsk analyze [options]
```

**Aliases:** `analyze`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `-i`, `--image_urls` | Yes |  (array) |
| `-r`, `--instruction` | Yes | Detailed instructions for image analysis, specifying: 1) What aspects of the images to analyze (e.g., objects, text, style, context), 2) How to analyze them (e.g., focus on specific details, compare elements), 3) What specific information to extract (e.g., key objects, text content, visual elements), and 4) Any particular context or perspective to consider during analysis. (string) |

## Local File Support

Parameters that accept URLs (`--image_urls`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
