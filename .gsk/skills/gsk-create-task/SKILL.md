---
name: gsk-create-task
version: 1.0.0
description: Create and execute tasks using specialized AI agents. Supports super_agent,
  podcasts, docs, slides, deep_research, website, video_generation, audio_generation,
  meeting_notes, cross_check.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk task --help
---

# gsk-create-task

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Create and execute tasks using specialized AI agents. Supports super_agent, podcasts, docs, slides, deep_research, website, video_generation, audio_generation, meeting_notes, cross_check.

## Usage

```bash
gsk task [options]
```

**Aliases:** `task`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<task_type>` (positional) | Yes | The type of task to create: - super_agent: Create general super agent - podcasts: Create audio podcasts with AI characters - docs: Create and edit HTML/Markdown documents. Create a professional document with Word-like formatting as a single-file HTML. Perfect for reports, articles, academic papers, and formal documents. **Guidelines** 1. This tool can be directly called when user explicitly wants to create: - A document or report - An article or academic paper - A formal document with professional formatting - A document for print or PDF export  2. In situations other than those mentioned above, you need to ask the user first and only call this tool after getting permission when user wants to create: - A better formatted text, but hasn't explicitly mentioned creating a document - Content that needs professional document formatting  **Limitations** - Document styling resembles Microsoft Word format, not web page design - Usually takes time to generate, so please strictly follow the guidelines above - slides: Create presentation slides. Convert collected materials into a set of slides written in HTML format and display them. Limitation: a) It usually takes minutes. Ask the user whether they want to wait for a longer time before starting if they haven't explicitly indicated they want to generate a set of slides; - website: Create a professional agent for building websites and web pages - deep_research: Create deep research agent for task on a 'deep research' topic (e.g. 'deep research on Tesla', 'analyze Tesla in depth'). Also can handle user's 'continue deep research' request - video_generation: Large-scale batch video generation with complex inter-task dependencies. Best for workflows requiring coordinated, multi-step video pipelines where tasks depend on each other's outputs. Supports text-to-video, image-to-video (query should contain the image url), and merging multiple video clips. Can reuse agent. NOT recommended for small-scale, simple, or independent video tasks — for those, use <tool>video_generation</tool> directly instead. If there is a resource generation list, you can directly pass the resource list URL in the query, http(s):// or aidrive:// - audio_generation: Large-scale batch TTS (text-to-speech) generation with complex inter-task dependencies. Best for workflows requiring coordinated, multi-step TTS pipelines where tasks depend on each other's outputs. Supports text-to-speech, voiceovers, multi-speaker dialogues, and merging multiple audio clips. Can reuse agent. NOT recommended for small-scale, simple, or independent TTS tasks — for those, use <tool>audio_generation</tool> directly instead. If there is a resource generation list, you can directly pass the resource list URL in the query, http(s):// or aidrive:// - cross_check: Fact-check and verify claims or statements. Use when the user wants to verify whether a statement is true, check facts, or cross-reference claims against multiple sources. The agent systematically searches for evidence, evaluates source credibility, and provides a detailed verification report with supporting references. - sheets: Create spreadsheet. This tool can convert collected materials into a spreadsheet, use only when user is explicitly requesting you to create a spreadsheet or excel table. (string, one of: super_agent, podcasts, docs, slides, website, deep_research, video_generation, audio_generation, cross_check, meeting_notes, sheets) |
| `--task_name` | Yes | Name for the task/project (string) |
| `--query` | Yes | Query for the task. The ending should clearly state what needs to be done, such as generating a doc/slides etc. (string) |
| `--instructions` | Yes | Detailed instructions for the task. This will be set as system prompt to the specialized agent. (string) |

> **CAUTION:** This command performs a write/send operation. Double-check parameters before executing.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
