import pRetry from "p-retry";

import {
  CreateKeyspaceCommand,
  DeleteKeyspaceCommand,
  GetKeyspaceCommand,
  Keyspace,
  KeyspaceAlreadyExistsError,
  KeyspaceNotFoundError,
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

export const createKeyspace = async (keyspaceName: string): Promise<Keyspace> => {
  let keyspace: Keyspace = await stashClient().send(
    new CreateKeyspaceCommand({ keyspaceName })
  )

  console.log(`${keyspaceName} keyspace status: ${keyspace.status}`);
  if (keyspace.status !== "ACTIVE") {
    console.log(`waiting for ${keyspaceName} keyspace to become ACTIVE`);
    const getKeyspaceCommand = new GetKeyspaceCommand({ keyspaceName });

    await pRetry(
      async () => {
        keyspace = await stashClient().send(getKeyspaceCommand);
        if (keyspace.status !== "ACTIVE") {
          throw new Error(`${keyspaceName} keyspace not active`);
        }
      },
      {
        retries: 4,
        minTimeout: 1000,
        maxTimeout: 5000,
      }
    );
  }

  console.log(`${keyspaceName} keyspace created successfully`);
  return keyspace;
};

export const deleteKeyspace = async (keyspaceName: string): Promise<void> => {
  let keyspace: Keyspace = await stashClient().send(
    new DeleteKeyspaceCommand({ keyspaceName })
  )

  console.log(`waiting for ${keyspaceName} keyspace deletion to finish`);
  const getKeyspaceCommand = new GetKeyspaceCommand({ keyspaceName });

  try {
    await pRetry(
      async () => {
        keyspace = await stashClient().send(getKeyspaceCommand);
        // when the deletion has been successful, the get command will throw KeyspaceNotFoundError
        throw new Error(`${keyspaceName} keyspace not finished deleting`);
      },
      {
        retries: 4,
        minTimeout: 1000,
        maxTimeout: 5000,
      }
    );
  } catch (e) {
    if (e instanceof KeyspaceNotFoundError) {
      console.log(`${keyspaceName} keyspace deleted successfully`);
      return;
    }

    throw e;
  }
};

// Create new keyspace if it doesn't already exist, otherwise delete existing
// keyspace and create a new one to ensure that it is in an empty state
export const ensureEmptyKeyspaceExists = async (keyspaceName: string): Promise<void> => {
  try {
    await createKeyspace(keyspaceName);
  } catch (e) {
    // re-throw anything other than KeyspaceAlreadyExistsError
    if (!(e instanceof KeyspaceAlreadyExistsError)) {
      throw e;
    }

    console.log(`${keyspaceName} keyspace already exists; deleting and re-creating to ensure empty state`);
    await deleteKeyspace(keyspaceName);
    await createKeyspace(keyspaceName);
  }
};
