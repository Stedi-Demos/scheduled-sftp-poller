import { z } from "zod";

export const ExternalSftpConfig = z.strictObject({
  hostname: z.string(),
  username: z.string(),
  password: z.string(),
  port: z.number().optional(),
  inboundPath: z.string().optional(),
  outboundPath: z.string().optional(),
});

export const ResourceIds = z.strictObject({
  key: z.string(),
  value: z.strictObject({
    guideId: z.string().optional(),
    mappingId: z.string().optional(),
  }),
});

export const BucketPaths = z.strictObject({
  inboundPath: z.string().optional(),
  outboundPath: z.string().optional(),
});

export const BucketConfig = z.strictObject({
  bucketName: z.string().optional(),
  paths: BucketPaths.optional(),
})

export const TradingPartnerConfig = z.strictObject({
  name: z.string(),
  myPartnershipId: z.string().optional(),
  externalSftpConfig: ExternalSftpConfig.optional(),
  resourceIds: z.array(ResourceIds).optional(),
  bucketConfig: BucketConfig.optional(),
  additionalConfig: z.any().optional(),
});

export const TradingPartner = z.strictObject({
  key: z.string(),
  value: TradingPartnerConfig,
});

export const TradingPartnerList = z.strictObject({
  partners: z.array(TradingPartner)
});

export type TradingPartnerList = z.infer<typeof TradingPartnerList>;
