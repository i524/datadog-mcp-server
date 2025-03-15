# datadog-mcp-server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```
"datadog-mcp-server": {
      "command": "npx",
      "args": ["-y", "@i524/datadog-mcp-server", "--stdio"],
      "env": {
        "DD_API_KEY": "<your-datadog-api-key>",
        "DD_APP_KEY": "<your-datadog-app-key>"
      }
    }
```
