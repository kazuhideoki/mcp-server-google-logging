import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface GcloudLoggingReadOptions {
  logFilter?: string;
  billingAccount?: string;
  bucket?: string;
  folder?: string;
  freshness?: string;
  limit?: number;
  location?: string;
  order?: 'desc' | 'asc';
  organization?: string;
  project?: string;
  resourceNames?: string[];
  view?: string;
}

export const gcloudLoggingRead = async (options: GcloudLoggingReadOptions = {}) => {
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
  let command = 'gcloud logging read';

  // Add log filter if provided
  if (logFilter) {
    command += ` "${logFilter}"`;
  }

  // Add optional flags
  if (billingAccount) command += ` --billing-account=${billingAccount}`;
  if (bucket) command += ` --bucket=${bucket}`;
  if (folder) command += ` --folder=${folder}`;
  if (freshness) command += ` --freshness=${freshness}`;
  if (limit) command += ` --limit=${limit}`;
  if (location) command += ` --location=${location}`;
  if (order) command += ` --order=${order}`;
  if (organization) command += ` --organization=${organization}`;
  if (project) command += ` --project=${project}`;
  
  if (resourceNames && resourceNames.length > 0) {
    command += ` --resource-names=${resourceNames.join(',')}`;
  }
  
  if (view) command += ` --view=${view}`;

  try {
    const { stdout } = await execPromise(command);
    return stdout;
  } catch (error: unknown) {
    console.error('Error executing gcloud logging read command:', error);
    throw error;
  }
};
