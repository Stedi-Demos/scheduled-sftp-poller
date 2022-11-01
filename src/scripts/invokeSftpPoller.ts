import { invokeFunction } from "../support/functions.js";
import { SftpPollingResults } from "../functions/sftp/external-poller/types.js";

(async () => {
  const functionName = "sftp-external-poller";
  const result = await invokeFunction(functionName);

  const parsedResult: SftpPollingResults = JSON.parse(result);
  const fileCountSummary = `${parsedResult.processedFileCount} file${parsedResult.processedFileCount === 1 ? "" : "s"}`;
  const processingErrorSummary =
    `${parsedResult.processingErrorCount} processing error${parsedResult.processingErrorCount === 1 ? "" : "s"}`;

  console.log("Done.\nSummary:");
  console.log(`\tpolled ${parsedResult.details.length} external SFTP server${parsedResult.details.length === 1 ? "" : "s"}`);
  console.log(`\tprocessed ${fileCountSummary} with ${processingErrorSummary} encountered`);
  console.log(`${JSON.stringify(parsedResult.details, null, 2)}`);
})();
