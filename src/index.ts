import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  CommandLineChoiceParameter,
  CommandLineParser,
  CommandLineStringParameter,
} from "@rushstack/ts-command-line";
import { gcloudLoggingRead } from "./gcloud-logging-read";

class GoogleLoggingCommandLine extends CommandLineParser {
  private _projectParam!: CommandLineStringParameter;

  public constructor() {
    super({
      toolFilename: "google_logging",
      toolDescription: "Google Logging MCP Server. use gcloud CLI",
    });

    this._projectParam = this.defineStringParameter({
      argumentName: "PROJECT",
      parameterLongName: "--project",
      parameterShortName: "-p",
      description: "Sets project",
      required: true,
    });
  }

  public getProject(): string | undefined {
    return this._projectParam.value;
  }
}

const commandLine = new GoogleLoggingCommandLine();
commandLine.executeAsync().catch((error) => {
  console.error("Error occurred when commandLine excuted", error);
  process.exit(1);
});

const args = {
  project: commandLine.getProject(),
};

const server = new McpServer({
  name: "Google Logging",
  version: "1.0.0",
});

server.tool(
  "read",
  {
    logFilter: z.string().optional(),
    billingAccount: z.string().optional(),
    bucket: z.string().optional(),
    folder: z.string().optional(),
    freshness: z.string().optional(),
    limit: z.number().optional(),
    location: z.string().optional(),
    order: z.enum(["desc", "asc"]).optional(),
    organization: z.string().optional(),
    project: z.string().optional(),
    resourceNames: z.array(z.string()).optional(),
    view: z.string().optional(),
  },
  async (params) => {
    // Use the project from command line arguments if not specified in the tool parameters
    const projectParam = params.project || args.project;

    // Clone params and update the project parameter
    const updatedParams = {
      ...params,
      project: projectParam,
    };

    try {
      const result = await gcloudLoggingRead(updatedParams);
      return {
        content: [{ type: "text", text: String(result) }],
      };
    } catch (error: unknown) {
      console.error("Error reading Google Cloud logs:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
      };
    }
  },
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);

console.log("MCP Google Logging server started");
console.log(`Project: ${args.project || "Not specified"}`);
