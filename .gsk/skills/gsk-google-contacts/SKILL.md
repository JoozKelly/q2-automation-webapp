---
name: gsk-google-contacts
version: 1.0.0
description: 'Google Contacts operations. Actions: search, get, create, update.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk contacts --help
---

# gsk-google-contacts

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Google Contacts operations. Actions: search, get, create, update.

## Usage

```bash
gsk contacts [options]
```

**Aliases:** `contacts`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'search': Search contacts by name, email, or phone; 'get': Get details of a specific contact; 'create': Create a new contact; 'update': Update an existing contact (string, one of: search, get, create, update) |
| `--query` | No | [search] Search query to find contacts. Searches across names, email addresses, phone numbers, and notes. (string) |
| `--limit` | No | [search] Maximum number of results to return (1-100). Default: 20 (integer) |
| `--account_id` | No | [search] Optional. The Gmail account ID to search (e.g., 'gmail-user@example.com'). If not provided, uses the default Gmail account. \| [get] Optional. The Gmail account ID (e.g., 'gmail-user@example.com'). If not provided, uses the default Gmail account. \| [create] Optional. The Gmail account ID (e.g., 'gmail-user@example.com'). If not provided, uses the default Gmail account. \| [update] Optional. The Gmail account ID (e.g., 'gmail-user@example.com'). If not provided, uses the default Gmail account. (string) |
| `--resource_name` | No | [get] The resource name of the contact to retrieve (e.g., 'people/c123456789'). This is returned from search results. \| [update] The resource name of the contact to update (e.g., 'people/c123456789'). Required. (string) |
| `--given_name` | No | [create] First name of the contact. \| [update] First name of the contact. (string) |
| `--family_name` | No | [create] Last name of the contact. \| [update] Last name of the contact. (string) |
| `--middle_name` | No | [create] Middle name of the contact. \| [update] Middle name of the contact. (string) |
| `--emails` | No | [create] List of email addresses. Each with 'value' and optional 'type' (home/work/other). \| [update] List of email addresses. Replaces all existing emails. (array) |
| `--phones` | No | [create] List of phone numbers. Each with 'value' and optional 'type' (home/work/mobile/other). \| [update] List of phone numbers. Replaces all existing phones. (array) |
| `--organization` | No | [create] Company or organization name. \| [update] Company or organization name. (string) |
| `--job_title` | No | [create] Job title at the organization. \| [update] Job title at the organization. (string) |
| `--department` | No | [create] Department at the organization. \| [update] Department at the organization. (string) |
| `--addresses` | No | [create] List of addresses with street, city, region, postal_code, country. \| [update] List of addresses. Replaces all existing addresses. (array) |
| `--birthday` | No | [create] Birthday with year (optional), month, and day. \| [update] Birthday with year (optional), month, and day. (object) |
| `--notes` | No | [create] Notes or biography for the contact. \| [update] Notes or biography for the contact. (string) |
| `--urls` | No | [create] List of URLs (websites, social profiles, etc.). \| [update] List of URLs. Replaces all existing URLs. (array) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
