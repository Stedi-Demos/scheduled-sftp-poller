export interface TradingPartnerList {
  items: Item[];
}

export interface Item {
  key:   string;  // key used to fetch a specific trading partner config (my trading partner's ID)
  value: TradingPartnerConfig;
}

export interface TradingPartnerConfig {
  name:                string;
  myPartnershipId?:     string;            // optional identifier used by my trading partner to identify my messages
  externalSftpConfig?: ExternalSFTPConfig; // optional SFTP connection details when using my trading partner's SFTP
  resourceIds?:        ResourceIds[];      // optional IDs for Stedi guides and mappings specific to this trading partner
  additionalConfig?:   any;                // optional freeform attribute to hold any additional config required
}

export interface ExternalSFTPConfig {
  hostname:      string;
  username:      string;
  password:      string;
  port?:         number; // optional SFTP connection port (default is 22)
  inboundPath?:  string; // optional path used for reading inbound documents
  outboundPath?: string; // optional path used for writing outbound documents
}

export interface ResourceIds {
  key:          string; // key used to identify resource IDs specifc to this customer (for example, "x12-5010-855")
  value: {
    guideId?:   string;
    mappingId?: string;
  }
}
