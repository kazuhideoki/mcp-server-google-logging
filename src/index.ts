import { z } from "zod";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CommandLineParser,
  CommandLineStringParameter,
} from "@rushstack/ts-command-line";
import {
  gcloudLoggingRead,
  GcloudLoggingReadSchema,
} from "./gcloud-logging-read";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

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

  public getProject(): string {
    return this._projectParam.value!;
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

server.tool("read", GcloudLoggingReadSchema.shape, async (params) => {
  // Use the project from command line arguments if not specified in the tool parameters
  const projectParam = params.project || args.project;

  // Clone params and update the project parameter
  const updatedParams = {
    ...params,
    project: projectParam,
  };

  try {
    console.log(
      "Calling gcloudLoggingRead with params:",
      JSON.stringify(updatedParams, null, 2),
    );
    const result = await gcloudLoggingRead(updatedParams);
    console.log("Result obtained successfully, length:", result.length);
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error: unknown) {
    console.error("Error reading Google Cloud logs:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
    };
  }
});

// Define schema for docs tool
const DocsSchema = z.object({
  type: z.enum(["OCPP"]).optional(),
});

// Add docs tool
server.tool("docs", DocsSchema.shape, async (params) => {
  try {
    // Read the doc.yaml file
    const docPath = path.resolve(__dirname, "doc.yaml");
    const docContent = fs.readFileSync(docPath, "utf8");

    // Parse the YAML content
    const docData = yaml.load(docContent) as Record<string, unknown>;

    // If type is specified, filter for that specific type
    if (params.type && docData && params.type in docData) {
      const filteredData = { [params.type]: docData[params.type] };
      return {
        content: [{ type: "text", text: yaml.dump(filteredData) }],
      };
    }

    // Return the full documentation
    return {
      content: [{ type: "text", text: docContent }],
    };
  } catch (error: unknown) {
    console.error("Error reading documentation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
    };
  }
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.log("MCP Google Logging server started");
  console.log(`Project: ${args.project || "Not specified"}`);
});
