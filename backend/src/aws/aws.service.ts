import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class AwsService {
  public readonly s3Service: S3Client;
  private readonly s3Bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        'Missing AWS configuration: region, accessKeyId, secretAccessKey, or bucket',
      );
    }

    this.s3Service = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.s3Bucket = bucket;
  }

  /**
   * Get the S3 bucket name used by this service
   */
  public getS3BucketName(): string {
    return this.s3Bucket;
  }

  /**
   * Generate a presigned S3 upload URL for a given filename and contentType
   */
  async getPresignedUploadUrl(
    userId?: string,
    fileType?: string,
    contentType = 'text/csv',
    fileExtension?: string,
  ) {
    if (!userId || !fileType) {
      throw new Error('userId and fileType are required');
    }

    // Create a base key with user ID and file type
    const baseKey = `${userId}/${fileType}/${uuidv4()}`;
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

  /**
   * Delete an object from S3 by key
   */
  async deleteObjectFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });
    await this.s3Service.send(command);
  }

  /**
   * Get a readable stream for an object from S3 by key
   */
  async getObjectStreamFromS3(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    });
    const response = await this.s3Service.send(command);
    // response.Body is a Readable stream
    return response.Body as Readable;
  }
}
