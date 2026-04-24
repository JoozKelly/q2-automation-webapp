---
name: gsk-outlook-calendar
version: 1.0.0
description: 'Outlook Calendar operations. Actions: list, create, delete.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk outlook_calendar --help
---

# gsk-outlook-calendar

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Outlook Calendar operations. Actions: list, create, delete.

## Usage

```bash
gsk outlook_calendar [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'list': List upcoming calendar events; 'create': Create a new calendar event; 'delete': Delete a calendar event (string, one of: list, create, delete) |
| `--filter_query` | No | [list] Text to filter calendar events by subject. Empty for listing all events in the time range. (string) |
| `--time_min` | No | [list] Optional. Start time for the calendar view (ISO 8601 timestamp). Defaults to 30 days ago. (string) |
| `--time_max` | No | [list] Optional. End time for the calendar view (ISO 8601 timestamp). Defaults to 60 days from now. (string) |
| `--from_account` | No | [list] Optional: Email address of the Outlook account to use. Use this when the user has multiple Outlook accounts connected. If not specified, uses the default Outlook account. \| [delete] Optional: Email address of the Outlook account to use. Use this when the user has multiple Outlook accounts connected. If not specified, uses the default Outlook account. (string) |
| `--summary` | No | [create] The title of the event (string) |
| `--location` | No | [create] The location of the event (string) |
| `--description` | No | [create] Description or details of the event. Supports restricted HTML formatting (safe subset rendered via Vue v-html): <a>, <b>, <strong>, <i>, <em>, <u>, <br>, <p>, <ul>, <ol>, <li>, <span>, <img>. Use for links, bold, italics, lists, line breaks, images. (string) |
| `--time_zone` | No | [create] Time zone for the event (e.g., 'GMT-07:00') (string) |
| `--time_zone_name` | No | [create] Time zone name for the event (e.g., 'America/Los_Angeles') (string) |
| `--start_time` | No | [create] Start time of the event in ISO 8601 format, must include correct timezone offset (e.g., 'yyyy-mm-ddThh:mm:ss+hh:mm') (string) |
| `--end_time` | No | [create] End time of the event in ISO 8601 format, must include correct timezone offset (e.g., 'yyyy-mm-ddThh:mm:ss-hh:mm') (string) |
| `--attendees` | No | [create] List of email addresses of attendees (array) |
| `--calendar_id` | No | [create] The calendar identifier. Use 'primary' for the user's primary calendar or provide a specific calendar email address (string) |
| `--event_id` | No | [create] The event identifier. If the request is to modify an existing event, provide the event_id of the event to be modified. If the request is to create a new event, leave this field empty. \| [delete] The Outlook Calendar event ID to delete (string) |
| `--recurrence` | No | [create] Recurrence pattern for the event (object) |
| `--send_notifications` | No | [create] Whether to send email notifications to attendees (boolean) |
| `--importance` | No | [create] Event importance (low, normal, high) (string) |
| `--sensitivity` | No | [create] Event sensitivity (normal, personal, private, confidential) (string) |
| `--show_as` | No | [create] Show as status (free, tentative, busy, oof, workingElsewhere, unknown) (string) |
| `--delete_series` | No | [delete] If true and the event is recurring, delete the entire series. If false, only delete the single instance. Default is false. (boolean, default: `False`) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
