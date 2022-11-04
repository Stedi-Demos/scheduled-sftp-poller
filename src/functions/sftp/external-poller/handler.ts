import Client from "ssh2-sftp-client";
import { serializeError } from "serialize-error";

import { PutObjectCommand } from "@stedi/sdk-client-buckets";

import { SftpPollingResults, SftpTradingPartnerPollingDetails } from "./types.js";
import { bucketClient } from "../../../lib/buckets.js";
import { getTradingPartners } from "../../../lib/tradingPartners.js";

export const handler = async (): Promise<SftpPollingResults> => {
  const allTradingPartners = await getTradingPartners();
  const tradingPartnersToPoll = allTradingPartners.partners.filter((tradingPartner) => tradingPartner.value.externalSftpConfig);

  const results: SftpPollingResults = {
    processedFileCount: 0,
    processingErrorCount: 0,
    details: [],
  };

  for await (const tradingPartner of tradingPartnersToPoll) {
    const tradingPartnerPollingResults: SftpTradingPartnerPollingDetails = {
      name: tradingPartner.value.name,
      filteredItems: [],
      processingErrors: [],
      processedFiles: [],
    };

    // @ts-ignore: non-null assertion is safe here because of filter operation above
    const tradingPartnerSftpConfig = tradingPartner.value.externalSftpConfig!;
    const sftpConfig = {
      host: tradingPartnerSftpConfig.hostname,
      port: tradingPartnerSftpConfig.port || 22,
      username: tradingPartnerSftpConfig.username,
      password: tradingPartnerSftpConfig.password,
    };

    const inboundDirectoryToScan = tradingPartnerSftpConfig.inboundPath || "/";
    if (!inboundDirectoryToScan.startsWith("/")) {
      tradingPartnerPollingResults.configurationError =
        new Error("invalid configuration: inboundPath must be an absolute path (must start with `/`)");
      break;
    }

    const destinationBucket = tradingPartner.value.bucketConfig?.bucketName || process.env["SFTP_BUCKET_NAME"];
    if (!destinationBucket) {
      tradingPartnerPollingResults.configurationError = new Error("no destination bucket configured");
      break;
    }

    const destinationPrefix = tradingPartner.value.bucketConfig?.paths?.inboundPath ||
      `trading_partners/${tradingPartner.value.name}/inbound`;

    if (destinationPrefix.startsWith("/")) {
      tradingPartnerPollingResults.configurationError =
        new Error("invalid configuration: bucketConfig.inboundPath must not start with `/`");
      break;
    }

    console.log(`polling sftp connection for: ${tradingPartner.value.name} (path=${inboundDirectoryToScan})`);

    const sftpClient = new Client();
    await sftpClient.connect(sftpConfig);

    const directoryContents = await sftpClient.list(inboundDirectoryToScan);

    for await (const item of directoryContents) {
      if (item.type !== "-") {
        tradingPartnerPollingResults.filteredItems.push({
          path: item.name,
          reason: "skipped due to not being a file",
        })
        break;
      }

      try {
        // Copy file contents via SFTP and upload to Stedi bucket for processing
        const sourcePath = `${inboundDirectoryToScan}/${item.name}`;
        const destinationPath =  `${destinationPrefix}/${item.name}`;
        const fileContents = await sftpClient.get(sourcePath);
        await bucketClient().send(new PutObjectCommand({
          bucketName: destinationBucket,
          key: destinationPath,
          body: fileContents,
        }));

        // Delete file from SFTP after processing
        await sftpClient.delete(sourcePath);

        results.processedFileCount++;
        tradingPartnerPollingResults.processedFiles.push(destinationPath);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(`unknown error: ${serializeError(e)}`);

        results.processingErrorCount++;
        tradingPartnerPollingResults.processingErrors.push({
          path: `${inboundDirectoryToScan}${item.name}`,
          error,
        });
      }
    }

    await sftpClient.end();
    results.details.push(tradingPartnerPollingResults);
  }

  return results;
};