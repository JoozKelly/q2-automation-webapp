---
name: gsk-batch-crawl-url-and-answer
version: 1.0.0
description: 'Crawl multiple URLs in parallel and answer specific questions from each.
  More efficient than calling crawler multiple times. Input: list of {url, questions_to_answer}
  jobs.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk batch-crawl --help
---

# gsk-batch-crawl-url-and-answer

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Crawl multiple URLs in parallel and answer specific questions from each. More efficient than calling crawler multiple times. Input: list of {url, questions_to_answer} jobs.

## Usage

```bash
gsk batch-crawl [options]
```

**Aliases:** `batch-crawl`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<jobs>` (positional) | Yes | A list of objects, each containing a URL to crawl and a list of questions to answer from that URL. (array) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
