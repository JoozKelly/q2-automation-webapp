---
name: gsk-audio-processing
version: 1.0.0
description: 'Preprocess audio: remove background noise, extract specific sounds,
  or enhance quality.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk audio-process --help
---

# gsk-audio-processing

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Preprocess audio: remove background noise, extract specific sounds, or enhance quality.

## Usage

```bash
gsk audio-process [options]
```

**Aliases:** `audio-process`, `ap`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<audio_url>` (positional) | Yes | URL or path to the audio file to process. Required for all models. (string) |
| `-m`, `--model` | Yes | elevenlabs/audio-isolation: Remove background noise, music, and non-speech elements from audio. Isolates clean vocals/speech. Best for cleaning up recordings before voice cloning. fal-ai/sam-audio/separate: Extract specific sounds from audio using a text prompt (e.g. 'singing voice', 'piano', 'drums'). Returns both the extracted sound and the residual. nova-sr: Enhance audio quality via super-resolution. Upscales to 48kHz sample rate. Good as a final post-processing step. (string, one of: elevenlabs/audio-isolation, fal-ai/sam-audio/separate, nova-sr) |
| `-p`, `--prompt` | No | Text prompt describing which sound to extract. Required for fal-ai/sam-audio/separate. Examples: 'singing voice', 'speech', 'piano', 'drums', 'background music'. (string) |
| `-f`, `--output_format` | No | Output audio format. For fal-ai/sam-audio: 'wav' or 'mp3'. For nova-sr: 'mp3', 'wav', 'aac', 'ogg', 'flac'. Default: 'mp3'. (string, default: `mp3`) |

## Local File Support

Parameters that accept URLs (`<audio_url>`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## Output File

Use `-o <path>` / `--output-file <path>` to download the generated result directly to a local file.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
