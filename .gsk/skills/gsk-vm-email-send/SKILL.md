---
name: gsk-vm-email-send
version: 1.0.0
description: Send an email from your OpenClaw VM's email address. Recipient must be
  in the VM's email allowlist or be your own login email.
metadata:
  category: vm_email
  requires:
    bins:
    - gsk
  cliHelp: gsk vm_email send --help
---

# gsk-vm-email-send

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Send an email from your OpenClaw VM's email address. Recipient must be in the VM's email allowlist or be your own login email.

## Usage

```bash
gsk vm_email send [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<to_email>` (positional) | Yes | Recipient email address (string) |
| `-s`, `--subject` | Yes | Email subject line (string) |
| `-b`, `--body` | Yes | Email body (plain text or markdown) (string) |
| `-f`, `--from_vm` | No | Sender VM email address or VM name. Defaults to the first running VM's email. (string) |

> **CAUTION:** This command performs a write/send operation. Double-check parameters before executing.

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
