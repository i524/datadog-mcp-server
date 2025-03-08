import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { client, v2 } from "@datadog/datadog-api-client";

const datadogConfiguration = client.createConfiguration();
const logsApi = new v2.LogsApi(datadogConfiguration);

const searchLogs = async (params: v2.LogsApiListLogsGetRequest) => {
  return await logsApi.listLogsGet({
    ...params,
  });
};

// Create server instance
const server = new McpServer({
  name: "datadog",
  version: "1.0.0",
});

server.tool(
  "search-logs",
  "search logs from datadog",
  {
    filterQuery: z.string({
      description: `A query string to filter logs. For more information, see https://docs.datadoghq.com/logs/explorer/search_syntax/`,
    }),
    filterFrom: z
      .string({
        description: `The minimum timestamp for requested logs. The value must be a string in ISO 8601 format.`,
      })
      .datetime()
      .optional(),
    filterTo: z
      .string({
        description: `The maximum timestamp for requested logs. The value must be a string in ISO 8601 format.`,
      })
      .datetime()
      .optional(),
    cursor: z
      .string({
        description: `The cursor to use for pagination. If not provided, the API will start at the beginning of the log stream.
      The cursor is returned in the 'nextCursor' field of the response.
      If 'nextCursor' is not available, use 'meta.page.after' field of the response.`,
      })
      .optional(),
  },
  async (params) => {
    try {
      const data = await searchLogs({
        filterQuery: params.filterQuery,
        filterFrom: params.filterFrom ? new Date(params.filterFrom) : undefined,
        filterTo: params.filterTo ? new Date(params.filterTo) : undefined,
        pageCursor: params.cursor,
      });
      const cursorObj = data.meta?.page?.after
        ? { nextCursor: data.meta.page.after }
        : {};
      return {
        content: [
          {
            type: "text",
            // NOTE: ログ情報は data.data に入っているため本来はそこだけ返したいが、
            // cline が nextCursor に対応していないため、全ての情報を返す
            text: JSON.stringify(data),
          },
        ],
        ...cursorObj,
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: e instanceof Error ? e.message : JSON.stringify(e),
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("datadog MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
