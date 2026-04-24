---
name: gsk-gmail
version: 1.0.0
description: 'Gmail operations. Actions: search, read, send, reply, forward, delete,
  archive, move, mark_as_read, add_label, remove_label, create_label, get_attachment,
  list_send_as.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk gmail --help
---

# gsk-gmail

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Gmail operations. Actions: search, read, send, reply, forward, delete, archive, move, mark_as_read, add_label, remove_label, create_label, get_attachment, list_send_as.

## Usage

```bash
gsk gmail [options]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'search': Search emails by query; 'read': Read a specific email by ID; 'send': Compose and send an email; 'reply': Reply to an existing email; 'forward': Forward an email to new recipients; 'delete': Delete an email; 'archive': Archive an email; 'move': Move an email to a different label/folder; 'mark_as_read': Mark an email as read or unread; 'add_label': Add a label to an email; 'remove_label': Remove a label from an email; 'create_label': Create a new Gmail label; 'get_attachment': Download an email attachment; 'list_send_as': List available send-as aliases (string, one of: search, read, send, reply, forward, delete, archive, move, mark_as_read, add_label, remove_label, create_label, get_attachment, list_send_as) |
| `--query` | No | [search] Query to filter emails using Gmail search syntax. Examples:\n- Simple: 'meeting'\n- From Sender: 'from:boss@example.com'\n- Subject: 'subject:report'\n- In Folder: 'in:spam', 'in:inbox', 'in:trash', 'in:sent'\n- Label: 'label:important'\n- Unread: 'is:unread'\n- Unread in Spam: 'in:spam is:unread'\n- Has Attachment: 'has:attachment'\n- Date Range: 'after:2024/01/01 before:2024/01/31'\n- Newer Than: 'newer_than:7d' (7 days)\n- Older Than: 'older_than:1m' (1 month)\nNote: Some queries like 'is:recent' are invalid. (string) |
| `--after_date` | No | [search] Filter emails received after this date (inclusive). Format: YYYY/MM/DD (e.g., '2024/01/01'). This is equivalent to adding 'after:YYYY/MM/DD' to the query. (string) |
| `--before_date` | No | [search] Filter emails received before this date (exclusive). Format: YYYY/MM/DD (e.g., '2024/01/31'). This is equivalent to adding 'before:YYYY/MM/DD' to the query. (string) |
| `--next_page_token` | No | [search] Next page token to retrieve more emails (optional). (string) |
| `--auto_paginate` | No | [search] If true, automatically fetches multiple pages until reaching max_total_results (default: 500). Returns ALL emails matching the query. (boolean) |
| `--max_total_results` | No | [search] Maximum total results to fetch when auto_paginate is true. Default: 500, Maximum: 500. (integer) |
| `--from_account` | No | [search] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [read] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [send] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [reply] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [forward] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [delete] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [archive] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [move] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [mark_as_read] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [add_label] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [remove_label] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [create_label] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [get_attachment] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. \| [list_send_as] Optional: Email address of the Gmail account to use. Use this when the user has multiple Gmail accounts connected. If not specified, uses the default Gmail account. (string) |
| `--id` | No | [read] The ID of the email to retrieve and read (string) |
| `--title` | No | [read] The title of the email to retrieve and read (string) |
| `--question` | No | [read] Question to answer guiding how to process the email content (string) |
| `--download_attachments` | No | [read] Whether need to download attachments from the email to analysis (boolean) |
| `--aidrive_path` | No | [read] Path in AIDrive where attachments should be saved. Default is /gmail_attachments/ \| [get_attachment] The path in AIDrive to save the attachment. Default: /gmail_attachments/ (string) |
| `--to` | No | [send] Email address(es) of the recipient(s). For multiple recipients, separate with commas. \| [forward] Email address(es) of the recipient(s). For multiple recipients, separate with commas. (string) |
| `--subject` | No | [send] The email subject line (string) |
| `--body` | No | [send] The email body content. **IMPORTANT**: The format of this field MUST match the content_type parameter: - If content_type='text/plain': Use plain text - If content_type='text/html': Use HTML format with tags like <h1>, <p>, <ul>, <li>, etc. **Note**: Email clients DO NOT support Markdown rendering. If you have Markdown content and want formatted display, you must convert it to HTML and set content_type='text/html'. \| [reply] The reply message body. **IMPORTANT**: The format of this field MUST match the content_type parameter: - If content_type='text/plain': Use plain text - If content_type='text/html': Use HTML format with tags like <h1>, <p>, <ul>, <li>, etc. **Note**: Email clients DO NOT support Markdown rendering. If you have Markdown content and want formatted display, you must convert it to HTML and set content_type='text/html'. \| [forward] Optional: Additional message to include above the forwarded content. This is your personal note to the recipients. (string) |
| `--cc` | No | [send] Optional: CC email address(es). For multiple recipients, separate with commas. \| [forward] Optional: CC email address(es). For multiple recipients, separate with commas. (string) |
| `--bcc` | No | [send] Optional: BCC email address(es). For multiple recipients, separate with commas. (string) |
| `--content_type` | No | [send] Content type of the email body. Default: text/html (recommended) **CRITICAL**: This parameter defines the format of the 'body' field: - 'text/plain': body should be plain text only - 'text/html': body MUST be valid HTML (e.g., '<h1>Title</h1><p>Content</p>') **Common mistake**: Setting content_type='text/html' but providing Markdown text (# Title, **bold**). This will display raw Markdown symbols in the email. Always convert Markdown to HTML before passing to this tool. \| [reply] Content type of the reply body. Default: text/html (recommended) **CRITICAL**: This parameter defines the format of the 'body' field: - 'text/plain': body should be plain text only - 'text/html': body MUST be valid HTML (e.g., '<h1>Title</h1><p>Content</p>') **Common mistake**: Setting content_type='text/html' but providing Markdown text. This will display raw Markdown symbols. Always convert Markdown to HTML first. \| [forward] Content type of the body. Default: text/html (recommended) **CRITICAL**: This parameter defines the format of the 'body' field: - 'text/plain': body should be plain text only - 'text/html': body MUST be valid HTML (e.g., '<h1>Title</h1><p>Content</p>') **Common mistake**: Setting content_type='text/html' but providing Markdown text. This will display raw Markdown symbols. Always convert Markdown to HTML first. (string, one of: text/plain, text/html) |
| `--from_address` | No | [send] Send-as email address to use as the sender. Use this to send as a group/alias address (e.g., 'feedback@company.com'). Must be configured in Gmail's 'Send mail as' settings. \| [reply] Send-as email address to use as the sender. Use this to reply as a group/alias address (e.g., 'feedback@company.com'). Must be configured in Gmail's 'Send mail as' settings. \| [forward] Send-as email address to use as the sender. Use this to forward as a group/alias address. Must be configured in Gmail's 'Send mail as' settings. (string) |
| `--skip_confirmation` | No | [send] If true, skip user confirmation and send immediately. Default is false (require confirmation before sending). \| [reply] If true, skip user confirmation and send immediately. Default is false (require confirmation before sending). \| [forward] If true, skip user confirmation and send immediately. Default is false (require confirmation before sending). \| [delete] If true, skip user confirmation and delete immediately. Default is false (require confirmation before deleting). \| [move] If true, skip user confirmation and move immediately. Default is false (require confirmation before moving). (boolean, default: `False`) |
| `--auto_skip_confirmation` | No | [send] Set to true ONLY if the workflow step has [AUTO_SKIP_CONFIRMATION] marker. This indicates the node is configured to always skip confirmation. \| [reply] Set to true ONLY if the workflow step has [AUTO_SKIP_CONFIRMATION] marker. This indicates the node is configured to always skip confirmation. \| [forward] Set to true ONLY if the workflow step has [AUTO_SKIP_CONFIRMATION] marker. This indicates the node is configured to always skip confirmation. \| [delete] Set to true ONLY if the workflow step has [AUTO_SKIP_CONFIRMATION] marker. This indicates the node is configured to always skip confirmation. \| [move] Set to true ONLY if the workflow step has [AUTO_SKIP_CONFIRMATION] marker. This indicates the node is configured to always skip confirmation. (boolean, default: `False`) |
| `--message_id` | No | [reply] The Gmail message ID to reply to \| [forward] The Gmail message ID to forward \| [delete] The Gmail message ID to delete \| [archive] The Gmail message ID to archive \| [move] The Gmail message ID to move \| [mark_as_read] (Deprecated, use message_ids) A single Gmail message ID to mark \| [add_label] The Gmail message ID to add label to \| [remove_label] The Gmail message ID to remove label from \| [get_attachment] The Gmail message ID containing the attachment (string) |
| `--reply_all` | No | [reply] Whether to reply to all recipients (TO and CC). Default: true (reply to all recipients including CC) (boolean) |
| `--include_attachments` | No | [forward] Whether to include original email attachments in the forward. Default: true (boolean, default: `True`) |
| `--label_name` | No | [move] The target label name. Use '/' for nested labels (e.g., 'Work/Projects'). The label will be created if it doesn't exist. \| [add_label] The label name to add. Can be a new label or an existing one. \| [remove_label] The label name to remove \| [create_label] The name of the label to create. Use '/' for nested labels (e.g., 'Parent/Child'). (string) |
| `--remove_from_inbox` | No | [move] Whether to remove the email from INBOX. Default: true (standard 'move' behavior). Set to false to just add the label without removing from inbox. (boolean) |
| `--create_if_not_exists` | No | [move] Whether to create the label if it doesn't exist. Default: true (boolean) |
| `--message_ids` | No | [mark_as_read] The Gmail message ID(s) to mark. Can be a single ID string or an array of IDs. |
| `--is_read` | No | [mark_as_read] Set to true to mark as read, false to mark as unread. Default: true (boolean) |
| `--label_list_visibility` | No | [create_label] The visibility of the label in the label list. Default: labelShow (string, one of: labelShow, labelShowIfUnread, labelHide) |
| `--message_list_visibility` | No | [create_label] The visibility of messages with this label. Default: show (string, one of: show, hide) |
| `--background_color` | No | [create_label] The background color of the label in hex format (e.g., '#16a765'). Optional. (string) |
| `--text_color` | No | [create_label] The text color of the label in hex format (e.g., '#ffffff'). Optional. (string) |
| `--filename` | No | [get_attachment] The filename of the attachment to retrieve. Use '*' to get all attachments. (string) |
| `--save_to_aidrive` | No | [get_attachment] Whether to save the attachment to AIDrive. Default: true (boolean) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
