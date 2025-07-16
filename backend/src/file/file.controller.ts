import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { CreateUserUploadFileDto } from './dto/create-user-upload-file.dto';
import { FileService } from './file.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly awsService: AwsService,
  ) {}

  // GET /file - List all customer files for the current user
  @Get()
  async listFiles(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.fileService.listFiles(userId);
  }

  // POST /file/upload - Get presigned S3 upload URL
  @Post('upload')
  async getPresignedUrl(
    @Body() body: { fileType: string; contentType?: string },
    @Req() req: Request,
  ) {
    const { fileType, contentType = 'text/csv' } = body;
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!fileType) {
      throw new Error('fileType is required');
    }
    return this.awsService.getPresignedUploadUrl(userId, fileType, contentType);
  }

  // POST /file - Save file metadata after upload
  @Post()
  async saveFileMetadata(
    @Body() dto: CreateUserUploadFileDto & { key: string },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const bucket = this.awsService.getS3BucketName();
    const file = await this.fileService.saveFileMetadata(userId, dto, bucket);
    return { success: true, id: file.id };
  }
}
