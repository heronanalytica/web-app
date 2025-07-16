import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserUploadFileDto } from './dto/create-user-upload-file.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  constructor(private readonly database: DatabaseService) {}

  async listFiles(userId: string) {
    return this.database.userUploadFile.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async saveFileMetadata(
    userId: string,
    dto: CreateUserUploadFileDto & { key: string },
    bucket: string,
  ) {
    const file = await this.database.userUploadFile.create({
      data: {
        id: uuidv4(),
        userId,
        fileName: dto.fileName,
        storageUrl: `s3://${bucket}/${dto.key}`,
        columns: dto.columns,
        type: dto.type,
        uploadedAt: new Date(),
      },
    });
    return file;
  }
}
