import { invokeFunction } from "../support/functions.js";
import { SftpPollingResults } from "../functions/sftp/external-poller/types.js";

(async () => {
  const functionName = "sftp-external-poller";
  console.log(`Invoking ${functionName} function\n`);
  const result = await invokeFunction(functionName);

  if ((result as any).hasOwnProperty("failureRecord")) {
    console.log(`Errors encountered during processing\n${JSON.stringify(result)}`);
    process.exit(-1);
  }

  const parsedResult: SftpPollingResults = JSON.parse(result);
  const fileCountSummary = `${parsedResult.processedFileCount} file${parsedResult.processedFileCount === 1 ? "" : "s"}`;
  const processingErrorSummary =
    `${parsedResult.processingErrorCount} processing error${parsedResult.processingErrorCount === 1 ? "" : "s"}`;

  console.log("Done.\nSummary:");
  console.log(`\t${parsedResult.details.length} external SFTP server${parsedResult.details.length === 1 ? "" : "s"} polled`);
  console.log(`\t${fileCountSummary} processed`);
  console.log(`\t${processingErrorSummary} encountered`);
  console.log(`${JSON.stringify(parsedResult.details, null, 2)}`);
})();
