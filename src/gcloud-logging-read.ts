import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execPromise = promisify(exec);

// Define Zod schema for validation
export const GcloudLoggingReadSchema = z.object({
  project: z.string(),
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
});

// Extract TypeScript type from the Zod schema
export type GcloudLoggingReadOptions = z.infer<typeof GcloudLoggingReadSchema>;

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
  } = options;

  // Build the gcloud command
  let command = "gcloud logging read";

  // Add log filter if provided
  if (logFilter) {
    command += ` "${logFilter}"`;
  }
  command += ` --project=${project}`;

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

  try {
    const { stdout } = await execPromise(command);
    return stdout;
  } catch (error: unknown) {
    console.error("Error executing gcloud logging read command:", error);
    throw error;
  }
};
