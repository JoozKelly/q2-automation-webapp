---
name: gsk-audio-generation
version: 1.0.0
description: Generate audio content including TTS, sound effects, and music.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk audio --help
---

# gsk-audio-generation

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Generate audio content including TTS, sound effects, and music.

## Usage

```bash
gsk audio [options]
```

**Aliases:** `audio`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<query>` (positional) | No | For text-to-speech generation: - For Gemini TTS (google/gemini-3.1-flash-tts-preview): Can use script_url field or query field. When using multi-speaker, include speaker prefixes like 'Speaker1: Hello there! Speaker2: Hi back!' - For elevenlabs/v3-tts: Supports both single and multi-speaker generation. For multi-speaker, include speaker prefixes like 'Speaker 1: Hello there! Speaker 2: Hi back!' - For other TTS models (Minimax): Use plain text without character names (e.g., use 'That's not what she meant, fatass.' instead of 'STAN: That's not what she meant, fatass.' as the character name will be pronounced). For sound effects, provide a detailed description of the audio to generate (e.g., 'A keyboard typing sound, rain, wind, etc.').For background music, provide a detailed description of the music to generate.must be in English if choosing CassetteAI/music-generator music generation.(e.g., 'Smooth chill hip-hop beat with mellow piano melodies, deep bass, and soft drums, perfect for a night drive. Key: D Minor, Tempo: 90 BPM.'). (string) |
| `-m`, `--model` | Yes | The model to use for audio generation. google/gemini-3.1-flash-tts-preview: Best, high-quality TTS with enhanced expressivity and granular audio tags ([whispers], [excited], [laughs], [sighs]). Supports inline expression control and multi-speaker dialogue with speaker prefixes (e.g., 'Speaker1: text, Speaker2: text').elevenlabs/v3-tts: Advanced multilingual text-to-speech model with multi-speaker dialogue support. Supports emotional tags like [excited], [whispers], [laughs]. Best for expressive content and conversations.fal-ai/elevenlabs/tts/multilingual-v2: High-quality multilingual text-to-speech model. For English, this is a preferred model.fal-ai/minimax/speech-2.8-hd: High-quality multilingual text-to-speech model. For Chinese, 'Chinese,Yue', Japanese, Korean, this is a preferred model. Note: Only one speaker can be used per generation. For multiple characters, please generate them one by one in sequence. elevenlabs/sound-effects: Sound effect generation model. Minimum duration is 0.1 seconds, maximum is 22 seconds.elevenlabs/music: ElevenLabs music generation model. Supports both instrumental music AND songs with vocals/singing. NOTE: Does NOT support custom lyrics - lyrics are auto-generated. Minimum duration is 10 seconds, maximum is 5 minutes (300 seconds). Professional music production quality.elevenlabs/voice-clone: ElevenLabs voice cloning model. Clone a voice from audio samples. Returns voice ID for use in TTS generation.elevenlabs/voice-changer: ElevenLabs voice changer model. Transform audio from one voice to another. Requires source audio and target voice ID.CassetteAI/music-generator: Background music generation model. minimum duration is 10 seconds, maximum is up to 180 seconds.fal-ai/minimax-music/v2.6: Song generation with lyrics using MiniMax Music 2.6. High-fidelity audio with humanized vocals. Supports markers (Verse), (Chorus), (Bridge), (Outro), (Instrumental intro). Requires both style prompt and lyrics.mureka/song-generator: Professional song generation with lyrics. Supports style prompts, reference tracks, vocal and melody inputs. Generate full songs with vocals. Maximum duration is 180 seconds.mureka/instrumental-generator: Instrumental music generation. Create background music and instrumental tracks without vocals. Supports style prompts and reference tracks. Maximum duration is 180 seconds.google/lyria-music: Google's Lyria 3 music generation model. High-quality 44.1kHz stereo output with vocals and lyrics support. Use sub_model='lyria-3-clip' for 30s clips or 'lyria-3-pro' for full songs (~3min). Supports custom lyrics with section tags like [Verse], [Chorus], [Bridge]. Multilingual vocals: English, Chinese, Japanese, French, Spanish, Korean, etc. (string, one of: google/gemini-3.1-flash-tts-preview, elevenlabs/v3-tts, fal-ai/elevenlabs/tts/multilingual-v2, fal-ai/minimax/speech-2.8-hd, elevenlabs/sound-effects, elevenlabs/music, elevenlabs/voice-clone, elevenlabs/voice-changer, CassetteAI/music-generator, fal-ai/minimax-music/v2.6, mureka/song-generator, mureka/instrumental-generator, google/lyria-music) |
| `-r`, `--requirements` | No | Required parameters for TTS generation. If you know the speaker name, you can also pass it in the requirementsDetailed description of how the TTS should be generated, including voice characteristics, emotion, pacing, accent, tone, etc. For example: 'A calm, professional female voice with British accent reading at moderate pace'.or 'Speaker1: Algenib, Speaker2: Kore' if you want to use specific speakersThis will be used by the agent to determine the appropriate voice and style parameters (string) |
| `--previous_audio_params` | No | Required parameters for TTS generation. The `generated_audios[].params` object from previous generation,get from previous tool call, when you need to fix the voice of a specific character, it will be useful. (object) |
| `-d`, `--duration` | No | The desired duration of the generated audio in seconds. Only applicable for sound effects generation.Default is 0, which means the model will determine the appropriate duration.For background music generation, set default to 30 seconds. (number, default: `0`) |
| `--custom_voice_id` | No | Custom voice ID for: 1. Minimax TTS - voice ID from voice cloning, 2. ElevenLabs Voice Changer - target voice ID to change to (string) |
| `--voice_files` | No | URLs or paths to voice sample files for voice cloning. Multiple samples improve clone quality. Required for ElevenLabs voice cloning model. (array) |
| `--source_audio_file` | No | URL or path to the source audio file for voice transformation. Required for ElevenLabs voice changer model. This is the audio that will be transformed to the target voice. (string) |
| `--image_urls` | No | The URLs of the images to use as a reference for the audio generation.(default is [], if the task is based on one or more reference images, it is required) (array) |
| `-l`, `--lyrics` | No | Lyrics for song generation. For google/lyria-music: custom lyrics with section tags like [Verse], [Chorus], [Bridge]. Works with both Clip and Pro. For Mureka song generator and MiniMax Music 2.6: required for vocal generation. (string) |

## Local File Support

Parameters that accept URLs (`--image_urls`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## Output File

Use `-o <path>` / `--output-file <path>` to download the generated result directly to a local file.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
