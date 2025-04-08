import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

server.tool("read", { a: z.number(), b: z.number() }, async ({ a, b }) => {
  const result = await gcloudLoggingRead();
  return {
    content: [{ type: "text", text: String(result) }],
  };
});
