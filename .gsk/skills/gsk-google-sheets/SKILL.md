---
name: gsk-google-sheets
version: 1.0.0
description: 'Google Sheets spreadsheet operations. Actions: create, read, write,
  append, search, export.'
metadata:
  category: general
  requires:
    bins:
    - gsk
  cliHelp: gsk sheets --help
---

# gsk-google-sheets

**PREREQUISITE:** Read `../gsk-shared/SKILL.md` for auth, global flags, and security rules.

Google Sheets spreadsheet operations. Actions: create, read, write, append, search, export.

## Usage

```bash
gsk sheets [options]
```

**Aliases:** `sheets`

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `<action>` (positional) | Yes | Action to perform. 'create': Create a new spreadsheet; 'read': Read data from a spreadsheet; 'write': Write data to a specific range; 'append': Append rows to a spreadsheet; 'search': Search spreadsheets by name; 'export': Export a spreadsheet to CSV or other format (string, one of: create, read, write, append, search, export) |
| `--title` | No | [create] Title of the new spreadsheet. (string) |
| `--sheet_names` | No | [create] Names of sheets to create. Default: ['Sheet1'] (array) |
| `--initial_data` | No | [create] Optional initial data for the first sheet. 2D array where each inner array is a row. (array) |
| `--spreadsheet_id` | No | [read] The ID of the spreadsheet to read from. \| [write] The ID of the spreadsheet to write to. \| [append] The ID of the spreadsheet to append to. \| [export] The ID of the Google Sheets spreadsheet to export. (string) |
| `--range` | No | [read] The A1 notation range to read (e.g., 'Sheet1!A1:D10', 'A1:B5'). Default: reads first sheet entirely. \| [write] The A1 notation range to write to (e.g., 'Sheet1!A1:D10'). The range should match the size of the data. \| [append] The A1 notation of a range to search for data table. New rows will be appended after the last row in this table. Example: 'Sheet1!A:D' or 'Sheet1' (string) |
| `--values` | No | [write] 2D array of values to write. Each inner array is a row. Example: [['Name', 'Age'], ['Alice', '30'], ['Bob', '25']] \| [append] 2D array of values to append. Each inner array is a row. Example: [['Alice', '30'], ['Bob', '25']] (array) |
| `--query` | No | [search] Search query to find spreadsheets by name or content. (string) |
| `--limit` | No | [search] Maximum number of results to return (1-50). Default: 10 (integer) |
| `--filename` | No | [export] Optional custom filename for the exported file (without extension). If not provided, the original spreadsheet name will be used. (string) |

## See Also

- [gsk-shared](../gsk-shared/SKILL.md) — Authentication and global flags
