---
name: gsk-voice-cloning
version: 1.0.0
description: Clone a voice from an audio sample using Minimax. Returns a voice ID
  for use with Minimax TTS.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk voice-clone --help
---

# gsk-voice-cloning

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Clone a voice from an audio sample using Minimax. Returns a voice ID for use with Minimax TTS.

## Usage

```bash
gsk voice-clone [options]
```

**Aliases:** `voice-clone`, `vc`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<query>` (positional) | No | A description or name for the cloned voice. (string) |
| `-m`, `--model` | Yes | fal-ai/minimax/voice-clone: Clone a voice from a sample audio using Minimax. Requires a single audio sample (min 10 seconds). Returns a custom_voice_id for use with fal-ai/minimax/speech-2.8-hd. (string, one of: fal-ai/minimax/voice-clone) |
| `-f`, `--voice_files` | Yes | URL or path to voice sample audio file (minimum 10 seconds). (array) |

## Output File

Use `-o <path>` / `--output-file <path>` to download the generated result directly to a local file.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
