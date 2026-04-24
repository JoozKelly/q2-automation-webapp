---
name: gsk-video-generation
version: 1.0.0
description: Generate videos using AI models. Supports text-to-video and image-to-video
  generation.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk video --help
---

# gsk-video-generation

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Generate videos using AI models. Supports text-to-video and image-to-video generation.

## Usage

```bash
gsk video [options]
```

**Aliases:** `video`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<query>` (positional) | Yes | Detailed description of the video to generate. duration is recommended to be 5 ~ 10 seconds. For image-to-image transitions (user provides start and end frames) e.g., 'A timelapse of a flower blooming in a garden'. (string) |
| `--file_name` | No | The name of the video to generate.  (string, null) |
| `-m`, `--model` | Yes | The model to use for video generation. kling/v3: Latest Kling V3 with audio. Pro/Standard quality modes. Supported ratios: 16:9, 9:16, 1:1. Duration: 3-15s. gemini/veo3.1: Gemini Veo 3.1 - Latest version with enhanced quality and features. Supports text-to-video and image-to-video generation with improved quality. Duration: 8s. Supported ratios: 16:9, 9:16. Supports fast_mode (faster generation) and hd_mode (1080p quality). gemini/veo3.1/reference-to-video: Gemini Veo 3.1 Reference-to-Video mode. Generate video using multiple reference images to guide the generation. Requires 1+ reference images. Duration: 8s. Supported ratios: 16:9, 9:16. Supports fast_mode and hd_mode options. gemini/veo3.1/first-last-frame-to-video: Veo 3.1 First-Last Frame mode. Generate video by specifying first and last frames for precise transitions. Requires exactly 2 images. Duration: 8s. Supported ratios: 16:9, 9:16. Supports fast_mode and hd_mode options.minimax/hailuo-2.3/standard: MiniMax Hailuo-2.3 Standard model for high-quality video generation. Supports both text-to-video and image-to-video generation with improved quality. Supports first & last frame control for precise video transitions. Fast generation (about 4min one video), cost-effective option. Supported ratios: 16:9, 9:16. Duration: 6s, 10s wan/v2.7: Wan v2.7 with enhanced motion smoothness and scene fidelity. Supports text-to-video, image-to-video, reference-to-video, and edit-video. Ratios: 16:9, 9:16, 1:1. Duration: 5s. Resolution: 480p, 720p vidu/q3: Vidu Q3 model with enhanced quality and audio generation. Supports both text-to-video and image-to-video generation. Supported ratios: 16:9, 9:16, 4:3, 3:4, 1:1. Duration: 1-16s. Resolution: 720p, 1080prunway/gen4_turbo: A model for generate video with high quality, fast.Supported ratios: 5:3, 3:5. Only support i2v. Duration: 5s, 10sofficial/pixverse/v5: A model for generate video with high quality, fast.fast(30s one video) but expensive. Supported ratios: 16:9, 9:16, 4:3, 1:1, 3:4. Duration: 5s, 8sAdditional features: 1. Generating smooth video transitions between two specified keyframes (start and end frames). pixverse/v6: PixVerse V6 latest model with lifelike motion, richer skin detail, real emotions. Full cinematic control including choreography and camera. Supports text-to-video, image-to-video, transition, and video extend generation. VFX, time-lapse, transformation scenes, product demos, 360° views, multi-shot storytelling. Extend: pass video_url to extend an existing video. Supported ratios: 16:9, 9:16, 4:3, 1:1, 3:4. Duration: 5s, 8s.  fal-ai/bytedance/seedance-2.0: Bytedance Seedance 2.0 model for highest quality video generation with native audio and lip-sync. Supports text-to-video and image-to-video with first/last frame control. Supported ratios: 21:9, 16:9, 4:3, 1:1, 3:4, 9:16. Duration: 4-15s. Resolution: 480p, 720p. Also supports reference-to-video with up to 9 images, 3 videos, or 3 audio refs via settings.sora-2: OpenAI Sora 2 video generation model for fast, creative videos. Supports text-to-video, image-to-video (reference frame), and video remixing. Designed for speed and experimentation. Supported ratios: 16:9, 9:16. Duration: 4s, 8s, 12ssora-2-pro: OpenAI Sora 2 Pro for production-quality videos. Higher fidelity than sora-2, best for cinematic footage and marketing assets. Supports 720p and 1080p resolutions. Supported ratios: 16:9, 9:16. Duration: 4s, 8sfal-ai/bytedance-upscaler/upscale/video: ByteDance Video Upscaler for enhancing video quality. Upscales videos to higher resolutions (2k) Requires video_url parameter. Does NOT generate new videos. Use when user wants to improve quality of existing videos.xai/grok-imagine-video: xAI Grok Imagine Video model for high-quality video generation. Supports both text-to-video and image-to-video generation. 720p HD output. Flexible duration 1-15 seconds. Supported ratios: 16:9, 4:3, 1:1, 3:4, 9:16, 21:9, 9:21. Duration: 1-15s. xai/grok-imagine-video/video-extension: xAI Grok Imagine Video Extension for extending existing videos. Requires video_url parameter with source video URL (MP4, 2-15s). 720p HD output. Duration: 2-10s. Ratios: 16:9, 4:3, 1:1, 3:4, 9:16, 21:9, 9:21. (string, one of: kling/v3, gemini/veo3.1, gemini/veo3.1/reference-to-video, gemini/veo3.1/first-last-frame-to-video, minimax/hailuo-2.3/standard, wan/v2.7, vidu/q3, runway/gen4_turbo, official/pixverse/v5, pixverse/v6, fal-ai/bytedance/seedance-2.0, sora-2, sora-2-pro, fal-ai/bytedance-upscaler/upscale/video, xai/grok-imagine-video, xai/grok-imagine-video/video-extension) |
| `-i`, `--image_urls` | No | The URLs of the images to use as reference key frames for the video generation. For single image models, provide 1 image. For multi-image models (like kling/v1.6/pro/elements), provide 1-4 images in sequence order. For start-end models (like vidu, pixverse), provide exactly 2 images (start and end frames). (default is [], if the task is based on one or more reference images, it is required) (array) |
| `-r`, `--aspect_ratio` | No | The aspect ratio of the video to generate. For image-to-video (i2v) generation, this should match the aspect ratio of your input image(s). (string, one of: 16:9, 9:16, 4:3, 1:1, 9:21) |
| `-d`, `--duration` | No | The duration of the video to generate in seconds. (number, default: `5`) |
| `-a`, `--audio_url` | No | Audio URL for audio integration in video generation. - Optional for Wan v2.5 model (custom audio: music or speech, WAV/MP3, 3-10s, up to 15MB) - Required for OmniHuman model (audio-driven animation) Leave empty if no audio is needed. (string, default: ``) |
| `--video_url` | No | Source video URL for video extension. Required for Grok Imagine Video Extension (extend existing video). Supports both web URLs and AI Drive paths (starting with '/' or 'aidrive://') (string, default: ``) |
| `--video_urls` | No | Input video URLs for video processing tasks. For Wan v2.7 reference-to-video: provide 1-3 reference videos (use @Video1, @Video2, @Video3 in prompt to reference them). (array, default: `[]`) |
| `--fast_mode` | No | Enable fast mode for quicker generation at lower cost. Applicable to Veo 3.1 and Seedance 2.0 models. Default: false. (boolean, default: `False`) |
| `--hd_mode` | No | Enable HD (1080p) mode for higher quality output. Only applicable to Veo 3.1 models. Higher cost (2x). Default: false. (boolean, default: `False`) |
| `--reference_mode` | No | Enable reference-to-video mode: provided images guide character/style rather than being used as the first frame. Requires image_urls. For Seedance 2.0: routes to seedance-2.0/ref (combinable with fast_mode, supports up to 9 reference images plus optional reference video/audio). For Veo 3.1 base model: upgrades to veo3.1/reference-to-video. Ignored on other models. Default: false. (boolean, default: `False`) |

## Local File Support

Parameters that accept URLs (`--image_urls`, `--audio_url`, `--video_url`, `--video_urls`) also accept local file paths. The CLI automatically uploads local files before sending to the API.

## Output File

Use `-o <path>` / `--output-file <path>` to download the generated result directly to a local file.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
