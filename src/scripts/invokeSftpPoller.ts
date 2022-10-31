import { invokeFunction } from "../support/functions.js";

(async () => {
  const functionName = "sftp-external-poller";
  const result = await invokeFunction(functionName);

  console.log(`Done.\n${JSON.stringify(JSON.parse(result), null, 2)}`);
})();
