import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UnauthorizedException,
  UseGuards,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { CreateUserUploadFileDto } from './dto/create-user-upload-file.dto';
import { FileService } from './file.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { contentTypeMap } from './constants';

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
    return {
      error: 0,
      data: await this.fileService.listFiles(userId),
    };
  }

  // POST /file/upload - Get presigned S3 upload URL
  @Post('upload')
  async getPresignedUrl(
    @Body()
    body: {
      fileType: string;
      contentType?: string;
      fileExtension?: string;
      assignedUserId?: string;
    },
    @Req() req: Request,
  ) {
    const {
      fileType,
      contentType = 'application/octet-stream',
      fileExtension,
      assignedUserId,
    } = body;
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!fileType) {
      throw new Error('fileType is required');
    }
    return {
      error: 0,
      data: await this.awsService.getPresignedUploadUrl(
        assignedUserId || userId,
        fileType,
        contentType,
        fileExtension,
      ),
    };
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
    const file = await this.fileService.saveFileMetadata(
      dto.assignedUserId || userId,
      dto,
      bucket,
    );
    return { error: 0, data: { id: file.id } };
  }

  // GET /file/download/:id - Download a file for the current user
  @Get('download/:id')
  async downloadFile(
    @Param('id') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    console.log(userId, fileId);
    // Find file and check ownership
    const file = await this.fileService.getFileByIdAndUser(fileId, userId);

    if (!file) {
      return res.status(404).send('File not found');
    }
    // Extract S3 key
    const storageUrl: string = file.storageUrl;
    const s3Key = storageUrl.replace(/^s3:\/\/[^/]+\//, '');
    try {
      const s3Stream = await this.awsService.getObjectStreamFromS3(s3Key);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      );
      // Infer content type from fileName
      const ext = file.fileName.split('.').pop()?.toLowerCase();

      const contentType =
        ext && contentTypeMap[ext]
          ? contentTypeMap[ext]
          : 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      s3Stream.pipe(res);
    } catch {
      res.status(404).send('File not found in storage');
    }
  }

  // DELETE /file/:id - Delete a file for the current user
  @Delete(':id')
  async deleteFile(@Param('id') fileId: string, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.fileService.deleteFile(userId, fileId);
    return { error: 0, message: 'File deleted' };
  }
}
