import dotenv from "dotenv";
import { fromAwsCredentialIdentity } from "@stedi/sdk-token-provider-aws-identity";

dotenv.config({ override: true });

const credentials = process.env.STEDI_API_KEY
  ? { apiKey: process.env.STEDI_API_KEY }
  : { token: fromAwsCredentialIdentity() };

export const DEFAULT_SDK_CLIENT_PROPS = {
  ...credentials,
  region: "us",
};

export const TRADING_PARTNERS_KEYSPACE_NAME = "trading-partner-configs";
