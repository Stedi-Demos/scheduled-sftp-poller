type FilteredItems = {
  path: string;
  reason: string;
};

type ProcessingError = {
  path: string;
  error: Error;
};

export type SftpTradingPartnerResults = {
  name: string;
  filteredItems: FilteredItems[];
  processingErrors: ProcessingError[];
  processedFiles: string[];
  configurationError?: Error,
};
