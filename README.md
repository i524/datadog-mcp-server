# Datadog MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to search and analyze Datadog logs directly. This integration allows AI assistants to query your Datadog logs using natural language, making troubleshooting and log analysis more efficient.

## Features

- **Log Searching**: Search Datadog logs using flexible query parameters
- **Time-Based Filtering**: Filter logs by specific time ranges
- **Pagination Support**: Navigate through large log sets with cursor-based pagination
- **Coming Soon**: Metrics retrieval functionality

## Prerequisites

- A Datadog account with API access
- Datadog API and Application keys(See [docs](https://docs.datadoghq.com/account_management/api-app-keys/) for detail)

## Setup

Add the MCP server configuration to your AI assistant's MCP settings file:

```json
"datadog-mcp-server": {
  "command": "npx",
  "args": ["-y", "@i524/datadog-mcp-server", "--stdio"],
  "env": {
    "DD_API_KEY": "<your-datadog-api-key>",
    "DD_APP_KEY": "<your-datadog-app-key>"
  }
}
```

## Usage

### Available Tools

#### search-logs

Search logs from Datadog with flexible filtering options.

**Parameters:**

- `filterQuery` (required): A query string to filter logs. See [Datadog Log Search Syntax](https://docs.datadoghq.com/logs/explorer/search_syntax/) for details.
- `filterFrom` (optional): The minimum timestamp for requested logs (ISO 8601 format).
- `filterTo` (optional): The maximum timestamp for requested logs (ISO 8601 format).
- `cursor` (optional): The cursor to use for pagination.

**Example Usage:**

```
// Search for error logs from a specific service in production
{
  "filterQuery": "service:awesome-service status:error",
  "filterFrom": "2025-01-01T00:00:00Z",
  "filterTo": "2025-01-02T00:00:00Z"
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
