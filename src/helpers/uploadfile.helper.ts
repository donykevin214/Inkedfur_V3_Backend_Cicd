import s3Client from '~/lib/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { fileInterface } from '~/interfaces';
import config from '~/config';
import { v4 as uuidv4 } from 'uuid';

const uploadFile = async (file: fileInterface, prefix: string) => {
  const filePath = prefix + uuidv4() + file.originalname;
  const putObjectCommand = new PutObjectCommand({
    Bucket: config.linode.bucket,
    Body: file.buffer,
    Key: filePath,
    ContentType: file.mimetype,
    ACL: 'public-read',
  });
  console.log('c');
  const result = await s3Client.send(putObjectCommand);
  console.log(result);
  if (result.$metadata.httpStatusCode === 200) {
    return config.linode.bucketUrl + filePath;
  } else {
    return '';
  }
};

export default uploadFile;
