# Stedi scheduled SFTP poller demo

This repo contains a demo for polling SFTP servers for files to process on a scheduled basis, via a GitHub workflow. When files are found during the polling operation, they are copied to a Stedi bucket and then deleted from the SFTP server. To automate the processing of these files, consider taking a look at the [Stedi read EDI demo](https://github.com/Stedi-Demos/read-edi-demo)!

The SFTP polling is orchestrated via a Stedi function called `sftp-external-poller`, which is written in [TypeScript](src/functions/sftp/external-poller/handler.ts). The function is invoked automatically according ot the scheduled defined in the [GitHub workflow](.github/workflows/scheduler.yaml).

On each scheduled invocation, the `sftp-external-poller` performs several steps:

1. Calls [Stash](https://www.stedi.com/docs/stash) to retrieve a list of configured trading partners.

1. Filters the list of trading partners to only include trading partners with external SFTP polling configuration details.

1. For each trading partner in the filtered list, connect to the trading partner's SFTP server using the corresponding connection configuration.

1. Looks for files to process on the trading partner's SFTP server

1. For each file found, copies the file to the path associated with the trading partner in a [Bucket](https://www.stedi.com/docs/buckets).

1. Deletes the file from the trading partner's SFTP server.

1. After processing all files that were found on the trading partner's SFTP server, closes the connection.

## Trading partner profiles

The SFP poller relies on trading partner profile data that is stored in [Stash](https://www.stedi.com/docs/stash). The trading partner profiles are created based on a JSON configuration file (which you will need to create during setup). An example configuration file containing basic properties for a single trading partner is shown below:

  ```json
  {
    "partners": [
      {
        "key": "ANOTHERMERCH",
        "value": {
          "name": "Another Merchant",
          "externalSftpConfig": {
            "hostname": "sftp.anothermerchant.com",
            "username": "sftpuser1",
            "password": "not-a-real-password"
          }
        }
      }
    ]
  }
  ```

### Trading partner profile configuration schema

The trading partner configuration file should conform to the TypeScript type shown below: 

  ```typescript
  export interface TradingPartnerConfig {
    name:                string;
    myPartnershipId?:    string;             // optional identifier used by my trading partner to identify my messages
    externalSftpConfig?: ExternalSFTPConfig; // optional SFTP connection details when using my trading partner's SFTP
    bucketConfig?:       BucketConfig        // optional path prefixes used for reading/writing files for this trading partner
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

  export interface BucketConfig {
    bucketName?: string; // optional bucket name used for reading/writing files for this trading partner (default is the bucket used to back Stedi SFTP)
    paths?: BucketPaths;
  }

  export interface BucketPaths {
    inboundPath?: string;  // optional path prefix used when reading incoming files from this trading partner (default is `trading_partners/${tradingPartnerName}/inbound`)
    outboundPath?: string; // optional path prefix used when writing outgoing files for this trading partner to pick up (default is `trading_partners/${tradingPartnerName}/outbound`)
  }

  export interface ResourceIds {
     key:          string; // key used to identify resource IDs specifc to this customer (for example, "x12-5010-855")
     value: {
       guideId?:   string;
       mappingId?: string;
     }
  }
  ```

There is an [example configuration file](src/tradingPartners/tradingPartnerList.example.json) that includes trading partners with a variety of configurations that can be used as a starting point to create a configuration file for your trading partners. 

## Prerequisites

1. [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) _(`npm` version must be 7.x or greater)_

1. Fork this repo to your account or organization and clone the forked repo (_note:_ the clone command below needs to be updated to match your location of your forked repo):

   ```bash
   git clone https://github.com/<YOUR-USER-OR-ORG>/scheduled-sftp-poller.git
   ```

1. Install the necessary dependencies:
 
   ```bash
   cd scheduled-sftp-poller
   npm ci
   ```

1. This project uses `dotenv` to manage the environmental variables required. You must create a `.env` file in the root directory of this repo and add one environment variable:
   * `STEDI_API_KEY`: Your Stedi API Key - used to deploy the function and internally to interact with product APIs. If you don't already have one, you can generate an [API Key here](https://www.stedi.com/app/settings/api-keys).

   Example `.env` file:
   ```
   STEDI_API_KEY=<REPLACE_ME>
   ```
   
1. Create a trading partner configuration file named `tradingPartnerList.json` in the [tradingPartners directory](src/tradingPartners). There is an [example file](src/tradingPartners/tradingPartnerList.example.json) in that same directory that can be copied and renamed to `tradingPartnerList.json` and updated with details for your trading partners. _Note:_ this file is intentionally excluded from git via the `.gitignore` file for the repo to avoid SFTP credentials from being stored in source control. The trading partner profile configuration must conform to the schema described above in the [Trading partner profiles](#trading-partner-profile-configuration-schema) overview.

1. Configure your trading partners by running:

   ```bash
   npm run configure-partners
   ```

   This will create an empty `trading-partner-configs` [Stash](https://www.stedi.com/docs/stash) keyspace, and store the trading partner configuration data specified in the `tradingPartnerList.json` file that you created above:

   ```bash
   trading-partner-configs keyspace status: CREATING
   waiting for trading-partner-configs keyspace to become ACTIVE
   trading-partner-configs keyspace created successfully
   processing trading partner: ANOTHERMERCH (Another Merchant)
   processing trading partner: 111222333444 (Yet Another Merchant)
   processing trading partner: TP merchant ID (Seriously Another Merchant)
    
   Done.
   Populated configuration details for 3 trading partners
   ```

1. Configure the Buckets (one for storing the downloaded files and one for tracking function executions):

   ```bash
   npm run configure-buckets
   ```

   For each bucket, an environment variable entry will automatically be added to the `.env` file. The output of the script will include a list of the environment variables that have been added:

   ```bash
   Updated .env file with 2 bucket entries:

   SFTP_BUCKET_NAME=4c22f54a-9ecf-41c8-b404-6a1f20674953-sftp
   EXECUTIONS_BUCKET_NAME=4c22f54a-9ecf-41c8-b404-6a1f20674953-executions
   ```

## Setup & Deployment

This repo includes a basic deployment script to bundle and deploy the `sftp-external-poller` function to Stedi. To deploy you must complete the following steps:

1. Confirm that your `.env` file contains the necessary environment variables:
   - `STEDI_API_KEY`
   - `SFTP_BUCKET_NAME`
   - `EXECUTIONS_BUCKET_NAME`

   It should look something like the following:

   ```
   STEDI_API_KEY=<YOUR_STEDI_API_KEY>
   SFTP_BUCKET_NAME=4c22f54a-9ecf-41c8-b404-6a1f20674953-sftp
   EXECUTIONS_BUCKET_NAME=4c22f54a-9ecf-41c8-b404-6a1f20674953-executions
   ```

1. To deploy the function:
   ```bash
   npm run deploy
   ```

   This should produce the following output:

   ```
   > stedi-sftp-poller@1.0.0 deploy
   > ts-node ./src/setup/deploy.ts

   Deploying sftp-external-poller
   Done sftp-external-poller
   Deploy completed at: 11/2/2022, 02:34:44 PM
   ```

## Invoking the function

### Invoking manually
Once deployed, you may invoke the function via the command line to verify functionality by running:

   ```bash
   npm run invoke-sftp-poller
   ```

This will invoke the deployed `sftp-external-poller` Stedi function and poll the SFTP servers for any trading partners for which you specified `externalSftpConfig` details in your `tradingPartnerList.json` configuration file to look for new contents. The output of the script will include a summary of the polling operations:

   ```bash
   > stedi-sftp-poller@1.0.0 invoke-sftp-poller
   > ts-node-esm ./src/scripts/invokeSftpPoller.ts
   
   Done.
   Summary:
	   1 external SFTP server polled
	   0 files processed
	   0 processing errors encountered
   [
     {
       "name": "Another Merchant",
       "filteredItems": [],
       "processingErrors": [],
       "processedFiles": []
     }
   ]
   ```

### Scheduled invocation

The repo includes a [scheduler GitHub action](./.github/workflows/scheduler.yaml) which can be used to invoke the function automatically on a scheduled basis. In order to enable the scheduled function executions, you will need to complete the following steps:

1. Create a new [repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets?tool=webui#creating-encrypted-secrets-for-a-repository) in your forked repo named `STEDI_API_KEY` and save the value of your API key as the secret value. This secret is referenced within the workflow and is passed as an environment variable to the script that invokes the `sftp-external-poller` Stedi function in your account. _Note:_ make sure there is no leading or trailing whitespace in the secret value as this will cause authentication to fail.

1. Enable the workflow to run in your forked repo. For security puposes, GitHub requires that you explicitly enable workflows that are copied over when a repo is forked. In your forked repo, click the `Actions` tab, and click the button to enable workflow runs.

#### Change invocation schedule
To change the schedule for invoking the SFTP poller, you can modify the `cron` attribute of the schedule in accordance with the [GitHub documentation for workflow schedules](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule). After making changes to the workflow definition, be sure to commit the changes and push them to your forked repo. 
