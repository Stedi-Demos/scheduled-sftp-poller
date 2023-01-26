import { ListValuesCommand } from "@stedi/sdk-client-stash";

import { TradingPartnerList } from "./types/tradingPartnerList.js";
import { TRADING_PARTNERS_KEYSPACE_NAME } from "./constants.js";
import { stashClient } from "./stash.js";

export const getTradingPartners = async (
  nextPageToken?: string
): Promise<TradingPartnerList> => {
  const listValuesResponse = await stashClient().send(
    new ListValuesCommand({
      keyspaceName: TRADING_PARTNERS_KEYSPACE_NAME,
      nextPageToken,
    })
  );

  if (!listValuesResponse.items) {
    throw new Error("no trading partners found");
  }

  const tradingPartnerList: TradingPartnerList = TradingPartnerList.parse({
    partners: listValuesResponse.items,
  });

  if (listValuesResponse.nextPageToken) {
    const remainingTradingPartners = await getTradingPartners(
      listValuesResponse.nextPageToken
    );
    return {
      partners: tradingPartnerList.partners.concat(
        remainingTradingPartners.partners
      ),
    };
  }

  return tradingPartnerList;
};
