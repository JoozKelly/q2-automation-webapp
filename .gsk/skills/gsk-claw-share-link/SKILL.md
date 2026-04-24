---
name: gsk-claw-share-link
version: 1.0.0
description: Generate a time-limited share URL for a file on a Genspark Claw VM. Use
  when the user is not in the web UI and you need to share a generated file.
metadata:
  category: claw
  requires:
    bins:
    - gsk
  cliHelp: gsk claw share_link --help
---

# gsk-claw-share-link

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Generate a time-limited share URL for a file on a Genspark Claw VM. Use when the user is not in the web UI and you need to share a generated file.

## Usage

```bash
gsk claw share_link [options]
```

**Aliases:** `share-link`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `-n`, `--vm_name` | Yes | Name of the VM that hosts the file. (string) |
| `<path>` (positional) | Yes | Absolute file path on the VM (e.g. /home/user/report.pdf). (string) |
| `-e`, `--expires_minutes` | No | Link validity in minutes, 1–1440. Default 10. (integer) |
| `-p`, `--password` | No | Optional password to protect the share link. Recipients must enter this password to view the file. Must be at least 8 characters with letters, digits, and special characters (e.g. 'xK9#mP2q'). Do NOT use simple dictionary words. (string) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
