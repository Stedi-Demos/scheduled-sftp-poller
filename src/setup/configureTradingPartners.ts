import * as fs from "fs";

import { SetValueCommand } from "@stedi/sdk-client-stash";

import { Convert } from "../lib/types/TradingPartnerList.js";
import { ensureKeyspaceExists, stashClient } from "../lib/stash.js";
import { TRADING_PARTNERS_KEYSPACE_NAME } from "../lib/constants.js";

(async () => {
  const configJson = fs.readFileSync("./tradingPartnerList.json", "utf8");
  const tradingPartnerList = Convert.toTradingPartnerList(configJson);

  await ensureKeyspaceExists(TRADING_PARTNERS_KEYSPACE_NAME);

  const promises = tradingPartnerList.items.map(async (tradingPartner) => {
    console.log(`processing trading partner ${JSON.stringify(tradingPartner)}`);
    const { key, value } = tradingPartner;
    await stashClient().send(new SetValueCommand({
      keyspaceName: "trading-partner-configs",
      key,
      // @ts-ignore: optional properties (like `externalSftpConfig`) cause errors because the underlying type for
      // `value` does not include `undefined`. Check can be ignored because they are handled correctly at runtime.
      value,
    }));
  });

  await Promise.all(promises);
  console.log("\nDone.");
  const total = tradingPartnerList.items.length;
  console.log(`Populated configuration details for ${total} trading partner${total === 1 ? "" : "s"}`);
})();