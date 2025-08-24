// backend/src/aws/aws.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

type PresignOpts = {
  isPublic?: boolean;
};

@Injectable()
export class AwsService {
  public readonly s3Service: S3Client;
  private readonly s3Bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION')!;
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');

    if (!this.region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        'Missing AWS configuration: region, accessKeyId, secretAccessKey, or bucket',
      );
    }

    this.s3Service = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
    });
    this.s3Bucket = bucket;
  }

  public getS3BucketName(): string {
    return this.s3Bucket;
  }

  private publicHttpUrlForKey(key: string) {
    // virtual-hosted–style URL
    return `https://${this.s3Bucket}.s3.${this.region}.amazonaws.com/${encodeURI(key)}`;
  }

  /**
   * Generate a presigned S3 upload URL.
   * - When fileType === 'campaign-photo' and opts.isPublic, writes to:
   *     campaign-photo/public/<uuid>.<ext>
   *   (world-readable if your bucket policy allows */ public; /*)
   */
  async getPresignedUploadUrl(
    userId?: string,
    fileType?: string,
    contentType = 'application/octet-stream',
    fileExtension?: string,
    { isPublic }: PresignOpts = {},
  ) {
    if (!userId || !fileType) {
      throw new Error('userId and fileType are required');
    }

    // Create a base key with user ID and file type
    const baseKey = isPublic
      ? `${userId}/${fileType}/public/${uuidv4()}`
      : `${userId}/${fileType}/${uuidv4()}`;
    // Append file extension if provided
    const key = fileExtension
      ? `${baseKey}.${fileExtension.replace(/^\./, '')}`
      : baseKey;

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3Service, command, {
      expiresIn: 300,
    });
    return { url, key };
  }

  async deleteObjectFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });
    await this.s3Service.send(command);
  }

  async getObjectStreamFromS3(key: string): Promise<Readable> {
    const command = new GetObjectCommand({ Bucket: this.s3Bucket, Key: key });
    const response = await this.s3Service.send(command);
    return response.Body as Readable;
  }
}
