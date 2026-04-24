---
name: gsk-google-calendar
version: 1.0.0
description: 'Google Calendar operations. Actions: list, create, delete.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk google_calendar --help
---

# gsk-google-calendar

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Google Calendar operations. Actions: list, create, delete.

## Usage

```bash
gsk google_calendar [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'list': List upcoming calendar events; 'create': Create a new calendar event; 'delete': Delete a calendar event (string, one of: list, create, delete) |
| `--filter_query` | No | [list] Text to filter calendar events, empty for listing all events (string) |
| `--time_min` | No | [list] Optional. Start time of the search range (RFC3339 timestamp) (string) |
| `--time_max` | No | [list] Optional. End time of the search range (RFC3339 timestamp) (string) |
| `--from_account` | No | [list] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [delete] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. (string) |
| `--summary` | No | [create] The title of the event (string) |
| `--location` | No | [create] The location of the event (string) |
| `--description` | No | [create] Description or details of the event. Supports restricted HTML formatting (safe subset rendered via Vue v-html): <a>, <b>, <strong>, <i>, <em>, <u>, <br>, <p>, <ul>, <ol>, <li>, <span>, <img>. Use for links, bold, italics, lists, line breaks, images. (string) |
| `--time_zone` | No | [create] Time zone for the event (e.g., 'GMT-07:00') (string) |
| `--time_zone_name` | No | [create] Time zone name for the event (e.g., 'America/Los_Angeles') (string) |
| `--start_time` | No | [create] Start time of the event in ISO 8601 format, must include correct timezone offset (e.g., 'yyyy-mm-ddThh:mm:ss+hh:mm') (string) |
| `--end_time` | No | [create] End time of the event in ISO 8601 format, must include correct timezone offset (e.g., 'yyyy-mm-ddThh:mm:ss-hh:mm') (string) |
| `--attendees` | No | [create] List of email addresses of attendees (array) |
| `--calendar_id` | No | [create] The calendar identifier. Use 'primary' for the user's primary calendar or provide a specific calendar email address (string) |
| `--event_id` | No | [create] The event identifier. If the request is to modify an existing event, provide the event_id of the event to be modified. If the request is to create a new event, leave this field empty. \| [delete] The Google Calendar event ID to delete (string) |
| `--recurrence` | No | [create] Recurrence rules (e.g., ['RRULE:FREQ=DAILY;COUNT=2']) (array) |
| `--send_notifications` | No | [create] Whether to send email notifications to attendees (boolean) |
| `--delete_series` | No | [delete] If true and the event is recurring, delete the entire series. If false, only delete the single instance. Default is false. (boolean, default: `False`) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
