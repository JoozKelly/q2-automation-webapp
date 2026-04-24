---
name: gsk-audio-transcribe
version: 1.0.0
description: Transcribe audio files to text with word-level timestamps.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk transcribe --help
---

# gsk-audio-transcribe

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Transcribe audio files to text with word-level timestamps.

## Usage

```bash
gsk transcribe [options]
```

**Aliases:** `transcribe`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `-i`, `--audio_urls` | Yes | List of audio file URLs to transcribe. Supports both web URLs and AI Drive paths. (array) |
| `--prompt` | No | Optional custom prompt to improve transcription quality. Can include context, proper nouns, or technical terms that should be recognized correctly. For example: 'This is a discussion about artificial intelligence and machine learning.'If you already know the corresponding transcript text, provide this text as the prompt to make it easier for the model to understand. (string) |
| `-m`, `--model` | No | Transcription model to use. Options: 'whisper-1' (default, supports timestamps), 'gemini-3-flash-preview' (no timestamp support), 'elevenlabs_scribe_v2' (supports word timestamps & entity detection). Note: gemini-3-flash-preview does not support word-level or segment-level timestamps. (string, one of: whisper-1, gemini-3-flash-preview, elevenlabs_scribe_v2, default: `whisper-1`) |
| `--entity_detection` | No | Entity types to detect (elevenlabs_scribe_v2 only). Options: 'pii' for personally identifiable information, 'name', 'dob', 'credit_card', 'ssn' for specific entities, 'all' for all entity types. Example: ['pii'] or ['name', 'credit_card'] (array) |

## Local File Support

Parameters that accept URLs (`--audio_urls`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
