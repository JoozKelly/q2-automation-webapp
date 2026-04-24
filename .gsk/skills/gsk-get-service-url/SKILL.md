---
name: gsk-get-service-url
version: 1.0.0
description: Get the public HTTPS URL for a service running on the sandbox. Use this
  to access web servers, APIs, or applications from outside.
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk service-url --help
---

# gsk-get-service-url

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Get the public HTTPS URL for a service running on the sandbox. Use this to access web servers, APIs, or applications from outside.

## Usage

```bash
gsk service-url [options]
```

**Aliases:** `service-url`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--port` | Yes | The port number where the HTTP service is running (e.g., 3000, 8080, 5000) (integer) |
| `--sandbox_id` | No | Optional sandbox ID. If not provided, it will be looked up from the project_id in GSK CLI config. (string) |
| `--service_name` | No | Optional descriptive name for the service (e.g., 'Express Server'). Used for logging. (string) |
| `--health_path` | No | Optional health check endpoint path (e.g., '/health'). If provided, will be included in the response. (string) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
