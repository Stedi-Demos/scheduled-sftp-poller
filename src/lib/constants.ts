import dotenv from "dotenv";
import { fromCredentials } from "@stedi/sdk-token-provider";

dotenv.config({ override: true });

const credentials = process.env.STEDI_API_KEY
  ? { apiKey: process.env.STEDI_API_KEY }
  : { token: fromCredentials() };

export const DEFAULT_SDK_CLIENT_PROPS = {
  ...credentials,
  region: "us",
};

export const TRADING_PARTNERS_KEYSPACE_NAME =  "trading-partner-configs";
