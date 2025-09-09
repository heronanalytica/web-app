import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserUploadFileDto } from './dto/create-user-upload-file.dto';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class FileService {
  constructor(
    private readonly database: DatabaseService,
    private readonly awsService: AwsService,
  ) {}

  async listFiles(userId: string, type?: string) {
    return this.database.userUploadFile.findMany({
      where: {
        userId,
        ...(type ? { type } : {}), // Filter by type if provided
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getFileById(id: string) {
    return this.database.userUploadFile.findUnique({
      where: { id },
    });
  }

  async saveFileMetadata(
    userId: string,
    dto: CreateUserUploadFileDto & { key: string },
    bucket: string,
  ) {
    const file = await this.database.userUploadFile.create({
      data: {
        id: dto.key.split('/').pop() || '',
        userId,
        fileName: dto.fileName,
        storageUrl: `s3://${bucket}/${dto.key}`,
        type: dto.type,
        uploadedAt: new Date(),
      },
    });
    return file;
  }

  async deleteFile(userId: string, fileId: string) {
    // Only allow deletion if the file belongs to the user
    const file = await this.database.userUploadFile.findUnique({
      where: { id: fileId },
    });
    if (!file || file.userId !== userId) {
      throw new Error('File not found or not authorized');
    }
    // Extract the S3 key from storageUrl (format: s3://bucket/key)
    const storageUrl: string = file.storageUrl;
    const s3Key = storageUrl.replace(/^s3:\/\/[^/]+\//, '');
    await this.awsService.deleteObjectFromS3(s3Key);
    await this.database.userUploadFile.delete({ where: { id: fileId } });
    return true;
  }

  async deleteFileById(fileId: string) {
    // Only allow deletion if the file belongs to the user
    const file = await this.database.userUploadFile.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new Error('File not found');
    }
    // Extract the S3 key from storageUrl (format: s3://bucket/key)
    const storageUrl: string = file.storageUrl;
    const s3Key = storageUrl.replace(/^s3:\/\/[^/]+\//, '');
    await this.awsService.deleteObjectFromS3(s3Key);
    await this.database.userUploadFile.delete({ where: { id: fileId } });
    return true;
  }

  // Get file metadata if file belongs to user, else null
  async getFileByIdAndUser(fileId: string, userId: string) {
    const file = await this.database.userUploadFile.findUnique({
      where: { id: fileId },
    });
    if (!file || file.userId !== userId) return null;
    return file;
  }
}
