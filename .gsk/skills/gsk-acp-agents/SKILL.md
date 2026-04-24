---
name: gsk-acp-agents
version: 1.0.0
description: ACP (Agent Client Protocol) agents backed by GSK task. Use these to generate documents, slides, spreadsheets, and more via multi-turn conversation.
metadata:
  category: general
  requires:
    bins:
      - gsk
---

# GSK ACP Agents

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

GSK task agents are available as ACP agents for multi-turn, streaming interaction. Use `sessions_spawn` with `runtime: "acp"` to create documents, presentations, spreadsheets, and more through natural language conversation.

## Available Agents

| Agent ID | Task Type | Description |
|----------|-----------|-------------|
| `gsk-docs` | docs | Create and edit HTML/Markdown documents (reports, articles, papers) |
| `gsk-slides` | slides | Create presentation slide decks |
| `gsk-sheets` | sheets | Create spreadsheets with formulas and formatting |
| `gsk-podcasts` | podcasts | Create audio podcasts with AI characters |
| `gsk-deep-research` | deep_research | In-depth research and analysis on any topic |
| `gsk-website` | website | Build professional websites and web pages |
| `gsk-video-generation` | video_generation | Batch video generation with multi-step pipelines |
| `gsk-audio-generation` | audio_generation | Batch TTS/audio generation with multi-step pipelines |
| `gsk-meeting-notes` | meeting_notes | Generate meeting notes and summaries |
| `gsk-cross-check` | cross_check | Fact-check and verify claims against multiple sources |
| `gsk-super-agent` | super_agent | General-purpose agent for complex multi-step tasks |

## Usage

Spawn an ACP agent session via the `sessions_spawn` tool:

```
sessions_spawn(
  task: "Create a quarterly sales report with charts",
  runtime: "acp",
  agentId: "gsk-docs"
)
```

The agent supports multi-turn conversation — follow up to refine, modify, or extend the output:

```
sessions_spawn(
  task: "Change the color scheme to blue and add a summary section",
  runtime: "acp",
  agentId: "gsk-docs",
  resumeSessionId: "<previous session id>"
)
```

## Examples

```
# Generate a presentation
sessions_spawn(task: "Create a 5-slide investor pitch deck for an AI startup", runtime: "acp", agentId: "gsk-slides")

# Create a spreadsheet
sessions_spawn(task: "Build a monthly budget tracker with income, expenses, and savings formulas", runtime: "acp", agentId: "gsk-sheets")

# Deep research
sessions_spawn(task: "Research the current state of fusion energy and summarize key players", runtime: "acp", agentId: "gsk-deep-research")

# Fact-check a claim
sessions_spawn(task: "Verify: 'GPT-4 has 1.8 trillion parameters'", runtime: "acp", agentId: "gsk-cross-check")
```

## Exporting Artifacts

After creating a document, slides, or spreadsheet, use `session/export` to download the artifact as a standard file (DOCX, PPTX, XLSX):

```
session/export({ format: "auto" })
session/export({ format: "docx", outputPath: "/tmp/report.docx" })
session/export({ format: "pptx", outputPath: "/tmp/deck.pptx" })
session/export({ format: "xlsx", outputPath: "/tmp/data.xlsx" })
session/export({ format: "pdf", outputPath: "/tmp/report.pdf" })
```

**Parameters:**
- `format` — Export format: `auto` (default, picks natural format for task type), `docx`, `pdf`, `pptx`, `xlsx`
- `outputPath` — Optional local file path. If provided, the file is downloaded and saved locally.

**Auto format mapping:**
| Task Type | Auto Format |
|-----------|-------------|
| docs | docx |
| slides | pptx |
| sheets | xlsx |

**Response:**
```json
{
  "download_url": "https://...",
  "file_name": "report.docx",
  "format": "docx",
  "local_path": "/tmp/report.docx",
  "size_bytes": 45678
}
```

For one-shot (non-ACP) mode, use the `-o` flag: `gsk task docs --prompt "..." -o report.docx`

## Features

- **Streaming**: Agent responses are streamed token-by-token in real-time
- **Multi-turn**: Continue refining output across multiple prompts in the same session
- **Session persistence**: Sessions survive disconnects and can be resumed
- **Export**: Download artifacts as DOCX/PPTX/XLSX/PDF via `session/export`
- **Cancellation**: In-progress prompts can be cancelled via `session/cancel`

## Getting Project URL

When you spawn an ACP agent, you can retrieve the Genspark project URL to share with the user for real-time viewing. The project URL becomes available a few seconds after the session starts.

### Flow

1. **Spawn the agent** and capture the `childSessionKey` from `sessions_spawn`:
   ```
   result = sessions_spawn(task: "Create a pitch deck", runtime: "acp", agentId: "gsk-slides")
   childSessionKey = result.childSessionKey
   ```

2. **Resolve the ACP session ID** from acpx session files using `exec`:
   ```bash
   grep -rl '"<childSessionKey>"' ~/.acpx/sessions/*.json | head -1 | xargs jq -r '.acp_session_id'
   ```

3. **Wait a few seconds** for the gsk agent to create the project:
   ```bash
   sleep 5
   ```

4. **Get the project URL**:
   ```bash
   gsk task get-project --session-id <acp_session_id>
   ```
   Returns:
   ```json
   {
     "session_id": "64a80148-cdf6-401c-ac4f-a2af4d254fc1",
     "project_id": "e42e8657-0c25-4b35-919c-f729f1e4461c",
     "project_url": "<base_url>/agents?id=e42e8657-0c25-4b35-919c-f729f1e4461c",
     "task_type": "slides"
   }
   ```
   If the project hasn't been created yet, returns `{ "status": "pending" }` with non-zero exit code.

5. **Share the URL immediately** with the user:
   > "I'm generating your slides now. You can watch the progress in real-time here: <project_url>"

6. The agent continues working in the background — the user can already see live updates on the web page.

### Resuming a Session

From the `get-project` output, use the `session_id` to resume and modify the output:

```
sessions_spawn(
  task: "Change the theme to dark blue",
  runtime: "acp",
  agentId: "gsk-slides",
  resumeSessionId: "<session_id from get-project>"
)
```

## Configuration

ACP agents are pre-configured in `~/.acpx/config.json` on Genspark Claw VMs. Each agent maps to `gsk task <type> --acp`.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
- [gsk-create-task](../gsk-create-task/SKILL.md) — One-shot task creation (non-ACP)
