---
name: gsk-shared
version: 1.0.0
description: "Shared foundation: authentication, global flags, output conventions, and security rules for all GSK CLI skills."
metadata:
  category: foundation
  requires:
    bins:
      - gsk
---

# GSK CLI — Shared Foundation

**PREREQUISITE:** Every GSK skill assumes this document has been read first.

## Installation

```bash
npm install -g @genspark/cli
```

Requires Node.js >= 18.

## Authentication

```bash
# Log in via browser (saves API key to ~/.genspark-tool-cli/config.json)
gsk login

# Or provide an API key directly
export GSK_API_KEY="gsk_..."

# Check current identity
gsk me
```

## Global Flags

| Flag | Env Var | Default | Description |
|------|---------|---------|-------------|
| `--api-key <key>` | `GSK_API_KEY` | — | API key (required) |
| `--base-url <url>` | `GSK_BASE_URL` | `https://www.genspark.ai` | API base URL |
| `--project-id <id>` | `GSK_PROJECT_ID` | — | Project ID for access control |
| `--debug` | — | `false` | Enable debug output |
| `--timeout <ms>` | — | `1800000` | Request timeout (30 min default) |
| `--output <format>` | — | `json` | Output format: `json` or `text` |
| `--refresh` | — | — | Force refresh cached tool schemas |

## Output Conventions

| Stream | Content | Consumer |
|--------|---------|----------|
| **stdout** | JSON result | Programs / AI agents |
| **stderr** | Progress, debug, error messages | Human / logs |

Always parse stdout as JSON. Use `--output text` for human-readable output.

## Local File Handling

Most commands that accept URLs also accept local file paths. The CLI automatically uploads local files before passing them to the API:

```bash
gsk analyze "Describe this" -i ./photo.jpg
gsk img "Enhance this" -i ./photo.png -o ./result.png
```

Use `-o` / `--output-file` to save generated results directly to a local file.

### Task agent export (`gsk task ... -o`)

For task agents (docs, slides, sheets), `-o` triggers an export to standard file formats after the task completes:

```bash
gsk task docs --prompt "Write a project report" -o ./report.docx
gsk task slides --prompt "Create a pitch deck" -o ./deck.pptx
gsk task sheets --prompt "Build a budget tracker" -o ./budget.xlsx
```

| Task Type | Default Export Format |
|-----------|---------------------|
| docs | DOCX |
| slides | PPTX |
| sheets | XLSX |

In ACP mode (`--acp`), use `session/export` instead — see [gsk-acp-agents](../gsk-acp-agents/SKILL.md).

## Configuration Priority

1. **CLI options** (highest)
2. **Environment variables**
3. **Config file** (`~/.genspark-tool-cli/config.json`)

## Security Rules

- Never expose your API key in shared scripts or logs.
- Use `--project-id` for access control when sharing resources.
- The CLI auto-updates every 4 hours. Disable with `GSK_NO_AUTO_UPDATE=1`.

## Built-in Commands

These commands are implemented in the CLI frontend and have no backend adaptor.

### list-tools

List all available tools.

```bash
gsk list-tools    # or: gsk ls
```

### upload

Upload a local file and get a file wrapper URL for use in other commands.

```bash
gsk upload ./image.png
gsk upload ./document.pdf
```

Returns a JSON object with `upload_url` and `file_wrapper_url`.

### download

Download a file from a file wrapper URL.

```bash
# Get download URL only
gsk download "/api/files/s/abc123"

# Download and save to local file
gsk download "/api/files/s/abc123" -s ./downloaded.png
```

| Flag | Description |
|------|-------------|
| `-s, --save <path>` | Download and save to local file path |

### init-opencode

Generate an `.opencode.json` config file for [OpenCode](https://opencode.ai), pre-configured to use Genspark's LLM proxy.

```bash
gsk init-opencode
gsk init-opencode --model claude-sonnet-4-6
gsk init-opencode -o ./my-project/.opencode.json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--model <name>` | `claude-opus-4-6-1m` | Default model for OpenCode |
| `-o, --out <path>` | `.opencode.json` | Output file path |

### init-skills

Sync GSK skill documents into the current project for AI agent discovery. Generates a `CONTEXT.md` entry point and optionally agent-specific config files.

```bash
# Copy skills to .gsk/skills/ and generate CONTEXT.md
gsk init-skills

# Also generate .claude/ config for Claude Code
gsk init-skills --agent claude

# Generate config for all supported agents
gsk init-skills --agent all

# Custom output directory
gsk init-skills -o ./docs/gsk-skills
```

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --out <dir>` | `.gsk/skills` | Output directory for skills |
| `--agent <type>` | — | Generate agent config: `claude`, `gemini`, or `all` |

**Generated files:**
- `CONTEXT.md` — Universal agent entry point listing all available skills
- `.claude/settings.json` — Claude Code context includes (when `--agent claude`)
- `gemini-extension.json` — Gemini extension config (when `--agent gemini`)

### AI Drive: local file upload

The `gsk drive upload` command supports streaming local files directly to AI Drive via `--local_file`. This is a CLI-only feature (not in the backend API).

```bash
# Upload a local file to AI Drive (streaming, supports 100MB+ files)
gsk drive upload --local_file ./report.pdf --upload_path /docs/report.pdf
gsk drive upload --local_file ./photo.png              # defaults to /photo.png
gsk drive upload --local_file ./doc.pdf --upload_path /docs/doc.pdf --override
```

| Flag | Description |
|------|-------------|
| `--local_file <path>` | Local file path to upload (streaming, no size limit) |
| `--override` | Overwrite existing file at the destination path |
