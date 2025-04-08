import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
import * as yaml from "js-yaml";

const execPromise = promisify(exec);

// Define Zod schema for validation
export const GcloudLoggingReadSchema = z.object({
  project: z.string().optional(),
  logFilter: z.string().optional(),
  billingAccount: z.string().optional(),
  bucket: z.string().optional(),
  folder: z.string().optional(),
  freshness: z.string().optional(),
  limit: z.number().optional(),
  location: z.string().optional(),
  order: z.enum(["desc", "asc"]).optional(),
  organization: z.string().optional(),
  resourceNames: z.array(z.string()).optional(),
  view: z.string().optional(),
  format: z.enum(["json", "yaml"]).optional().default("yaml"),
});

// Extract TypeScript type from the Zod schema
export type GcloudLoggingReadOptions = z.infer<typeof GcloudLoggingReadSchema>;

// Define the fields to keep in the filtered output
const FIELDS_TO_KEEP = ["textPayload", "jsonPayload", "labels", "timestamp"];

export const gcloudLoggingRead = async (options: GcloudLoggingReadOptions) => {
  const {
    logFilter,
    billingAccount,
    bucket,
    folder,
    freshness,
    limit,
    location,
    order,
    organization,
    project,
    resourceNames,
    view,
    format,
  } = options;

  // Build the gcloud command
  let command = "gcloud logging read";

  // Add log filter if provided
  if (logFilter) {
    command += ` "${logFilter}"`;
  }
  if (project) command += ` --project=${project}`;

  // Add optional flags
  if (billingAccount) command += ` --billing-account=${billingAccount}`;
  if (bucket) command += ` --bucket=${bucket}`;
  if (folder) command += ` --folder=${folder}`;
  if (freshness) command += ` --freshness=${freshness}`;
  if (limit) command += ` --limit=${limit}`;
  if (location) command += ` --location=${location}`;
  if (order) command += ` --order=${order}`;
  if (organization) command += ` --organization=${organization}`;

  if (resourceNames && resourceNames.length > 0) {
    command += ` --resource-names=${resourceNames.join(",")}`;
  }

  if (view) command += ` --view=${view}`;

  // Always get output in JSON format regardless of requested format
  command += " --format=json";

  try {
    console.log(`Executing command: ${command}`);
    const { stdout } = await execPromise(command);
    
    // Debug: Log the raw output
    console.log(`Raw stdout (first 200 chars): ${stdout.substring(0, 200)}...`);
    
    // Handle empty output
    if (!stdout || stdout.trim() === '') {
      console.log("Empty output received from gcloud command");
      return format === "yaml" ? "[]" : "[]";
    }
    
    try {
      // Parse the JSON output
      const logs = JSON.parse(stdout);
      
      // Handle non-array response
      if (!Array.isArray(logs)) {
        console.error("Expected array but got:", typeof logs);
        const logArray = logs ? [logs] : [];
        
        // Filter each log entry to keep only the specified fields
        const filteredLogs = logArray.map((log: any) => {
          const filteredLog: Record<string, any> = {};
          
          for (const field of FIELDS_TO_KEEP) {
            if (log[field] !== undefined) {
              filteredLog[field] = log[field];
            }
          }
          
          return filteredLog;
        });
        
        // Convert to the requested output format
        if (format === "yaml") {
          return yaml.dump(filteredLogs);
        } else {
          return JSON.stringify(filteredLogs, null, 2);
        }
      }
      
      // Process normal array response
      const filteredLogs = logs.map((log: any) => {
        const filteredLog: Record<string, any> = {};
        
        for (const field of FIELDS_TO_KEEP) {
          if (log[field] !== undefined) {
            filteredLog[field] = log[field];
          }
        }
        
        return filteredLog;
      });
      
      // Convert to the requested output format
      if (format === "yaml") {
        return yaml.dump(filteredLogs);
      } else {
        return JSON.stringify(filteredLogs, null, 2);
      }
    } catch (error) {
      const parseError = error as Error;
      console.error("JSON parsing error:", parseError);
      console.error("Raw stdout:", stdout);
      throw new Error(`Failed to parse JSON output: ${parseError.message}`);
    }
  } catch (error: unknown) {
    console.error("Error executing gcloud logging read command:", error);
    throw error;
  }
};
