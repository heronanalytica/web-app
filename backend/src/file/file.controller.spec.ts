import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { AwsService } from '../aws/aws.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

jest.mock('src/auth/auth.utils', () => ({
  isAdmin: jest.fn().mockReturnValue(false),
}));

describe('FileController', () => {
  let controller: FileController;
  let fileService: jest.Mocked<FileService>;
  let awsService: jest.Mocked<AwsService>;

  beforeEach(async () => {
    const mockFileService = {
      listFiles: jest.fn(),
      saveFileMetadata: jest.fn(),
      getFileByIdAndUser: jest.fn(),
      deleteFile: jest.fn(),
      deleteFileById: jest.fn(),
    };

    const mockAwsService = {
      getPresignedUploadUrl: jest.fn(),
      getS3BucketName: jest.fn().mockReturnValue('mock-bucket'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        { provide: FileService, useValue: mockFileService },
        { provide: AwsService, useValue: mockAwsService },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get(FileService);
    awsService = module.get(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listFiles', () => {
    it('should throw UnauthorizedException if no user', async () => {
      const req = { user: undefined } as unknown as Request;
      await expect(controller.listFiles(req)).rejects.toThrow(UnauthorizedException);
    });

    it('should return files', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      fileService.listFiles.mockResolvedValue([]);
      const result = await controller.listFiles(req, 'type');
      expect(fileService.listFiles).toHaveBeenCalledWith('user-1', 'type');
      expect(result).toEqual({ error: 0, data: [] });
    });
  });

  describe('getPresignedUrl', () => {
    it('should return prepresigned url', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      awsService.getPresignedUploadUrl.mockResolvedValue({ url: 'url', key: 'key' });

      const result = await controller.getPresignedUrl({ fileType: 'img' }, req);
      expect(awsService.getPresignedUploadUrl).toHaveBeenCalled();
      expect(result).toEqual({ error: 0, data: { url: 'url', key: 'key' } });
    });
  });

  describe('saveFileMetadata', () => {
    it('should save metadata and return id', async () => {
      const req = { user: { id: 'user-1' } } as unknown as Request;
      fileService.saveFileMetadata.mockResolvedValue({ id: 'f-1' } as any);

      const result = await controller.saveFileMetadata({ key: 'k', fileType: 'img', fileName: 'mock', type: 'img' } as any, req);
      expect(fileService.saveFileMetadata).toHaveBeenCalledWith('user-1', expect.any(Object), 'mock-bucket');
      expect(result).toEqual({ error: 0, data: { id: 'f-1' } });
    });
  });
});
