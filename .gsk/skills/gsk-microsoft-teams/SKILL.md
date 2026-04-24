---
name: gsk-microsoft-teams
version: 1.0.0
description: 'Microsoft Teams operations. Actions: send, list_channels, list_chats,
  list_teams, search, search_users, create_chat.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk teams --help
---

# gsk-microsoft-teams

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Microsoft Teams operations. Actions: send, list_channels, list_chats, list_teams, search, search_users, create_chat.

## Usage

```bash
gsk teams [options]
```

**Aliases:** `teams`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'send': Send a message in Teams; 'list_channels': List channels in a team; 'list_chats': List recent chats; 'list_teams': List teams the user belongs to; 'search': Search messages; 'search_users': Search for users; 'create_chat': Create a new chat (string, one of: send, list_channels, list_chats, list_teams, search, search_users, create_chat) |
| `--content` | No | [send] The message content to send. Supports HTML formatting including clickable links. Use <a href='URL'>text</a> for links, <b>text</b> for bold, <i>text</i> for italic, <br> for line breaks, and other standard HTML tags. (string) |
| `--chat_id` | No | [send] Optional chat ID to send the message to. If not specified or set to 'self', sends to yourself as a DM. Use chat IDs from microsoft_teams_search_messages results. (string) |
| `--channel_type` | No | [send] Type of channel: 'teams_chat' for 1:1 or group chats, 'teams_channel' for team channels. Default: 'teams_chat' (string, one of: teams_chat, teams_channel) |
| `--team_id` | No | [send] Required if channel_type is 'teams_channel'. The team ID where the channel belongs. \| [list_channels] The ID of the team to list channels for. (string) |
| `--channel_id` | No | [send] Required if channel_type is 'teams_channel'. The channel ID within the team. (string) |
| `--importance` | No | [send] Message importance level that controls notification behavior. 'normal': Regular message, no special notification (default). 'high': Triggers notification without special emphasis. 'urgent': Triggers immediate notification with sound and alert. Default: 'normal' (string, one of: normal, high, urgent) |
| `--notify` | No | [send] Whether to force notification by @mentioning yourself in the message. When true, adds a self-mention to ensure notification is triggered. Useful when sending reminders to yourself. Default: true (boolean) |
| `--mention_user_ids` | No | [send] List of user IDs (GUIDs) to @mention in the message. Use search_users to find user IDs first. The message content should include {mention_N} placeholders where N is the index (0-based), e.g., '{mention_0} thank you' will @mention the first user in the list. (array) |
| `--mention_user_names` | No | [send] Display names for mentioned users, in same order as mention_user_ids. If not provided, will use user IDs as display names. (array) |
| `--topic` | No | [list_chats] Search for chats by topic/name (case-insensitive partial match). Use this to find a specific group chat by its name. Example: 'WorkflowTest' to find a chat with that topic. \| [create_chat] Topic/name for the group chat. Required for group chats (2+ members), ignored for 1:1 chats. (string) |
| `--chat_type` | No | [list_chats] Filter by chat type. 'oneOnOne' for 1:1 chats, 'group' for group chats, 'meeting' for meeting chats, 'all' for all types. Default: 'all' (string, one of: oneOnOne, group, meeting, all) |
| `--count` | No | [list_chats] Maximum number of chats to return. Default: 50 \| [list_teams] Maximum number of teams to return. Default: 50 \| [search] The maximum number of messages to return. Default is 100. \| [search_users] Maximum number of users to return. Default: 10 (integer) |
| `--query` | No | [search] The search query using KQL (Keyword Query Language). **Query Behavior**: • Spaces = AND: 'project meeting' finds messages with BOTH terms • OR operator: 'project OR meeting' finds messages with EITHER term • KQL modifiers: 'from:john', 'hasAttachment:true', 'sent>2024-01-01', 'IsRead:false' • Examples: 'urgent project', 'bug OR issue', 'from:alice budget', 'hasAttachment:true report' \| [search_users] Search query - can be a name, email, or partial match. Example: 'John', 'john@company.com', 'Smith' (string) |
| `--unread_only` | No | [search] Set to true to search for unread messages only. Default is false. (boolean) |
| `--question` | No | [search] A specific question to answer based on the search results. (string) |
| `--include_chat_id` | No | [search_users] If true, also return the chat_id for existing 1:1 chats with each user. This allows direct messaging without create_chat. Default: true (boolean) |
| `--member_emails` | No | [create_chat] List of email addresses of users to add to the chat. One email for 1:1 chat, multiple for group chat. (array) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
