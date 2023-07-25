import  { S3Client } from "@aws-sdk/client-s3";
import config from "~/config";
const s3Client = new S3Client({
  endpoint: config.linode.endpoint,
  region: config.linode.region,
  credentials: {
    accessKeyId: config.linode.accessKey,
    secretAccessKey: config.linode.secretKey,
  },
});

export default s3Client;