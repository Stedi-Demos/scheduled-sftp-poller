type FilteredItems = {
  path: string;
  reason: string;
};

type ProcessingError = {
  path: string;
  error: Error;
};

export type SftpTradingPartnerPollingDetails = {
  name: string;
  filteredItems: FilteredItems[];
  processingErrors: ProcessingError[];
  processedFiles: string[];
  configurationError?: Error;
};

export type SftpPollingResults = {
  processedFileCount: number;
  processingErrorCount: number;
  details: SftpTradingPartnerPollingDetails[];
};
