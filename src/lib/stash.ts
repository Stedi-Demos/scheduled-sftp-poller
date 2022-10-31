import pRetry from "p-retry";

import {
  CreateKeyspaceCommand, GetKeyspaceCommand,
  KeyspaceAlreadyExistsError,
  StashClient,
  StashClientConfig
} from "@stedi/sdk-client-stash";

import { DEFAULT_SDK_CLIENT_PROPS } from "./constants.js";

let _stashClient: StashClient;

export const stashClient = (): StashClient => {
  if (_stashClient === undefined) {
    const config: StashClientConfig = {
      ...DEFAULT_SDK_CLIENT_PROPS,
      endpoint: "https://stash.us.stedi.com/2022-04-20",
    };
    _stashClient = new StashClient(config);
  }

  return _stashClient;
};

export const ensureKeyspaceExists = async (keyspaceName: string): Promise<void> => {
  try {
    const createKeyspaceResult = await stashClient().send(
      new CreateKeyspaceCommand({ keyspaceName })
    );

    console.log(`${keyspaceName} keyspace status: ${createKeyspaceResult.status}`);
    if (createKeyspaceResult.status !== "ACTIVE") {
      console.log(`waiting for ${keyspaceName} keyspace to become ACTIVE`);
      const getKeyspaceCommand = new GetKeyspaceCommand({ keyspaceName });

      await pRetry(
        async () => {
          const getKeyspaceResponse = await stashClient().send(getKeyspaceCommand);
          if (getKeyspaceResponse.status !== "ACTIVE") {
            throw new Error(`keyspace not active: ${keyspaceName}`);
          }
        },
        {
          retries: 4,
          minTimeout: 1000,
          maxTimeout: 5000,
        });
    }
  } catch (e) {
    // if keyspace already exists, just return
    if (e instanceof KeyspaceAlreadyExistsError) {
      return;
    }

    throw e;
  }
};