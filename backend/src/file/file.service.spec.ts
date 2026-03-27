import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { DatabaseService } from 'src/database/database.service';
import { AwsService } from 'src/aws/aws.service';

describe('FileService', () => {
  let service: FileService;
  let dbService: jest.Mocked<DatabaseService>;
  let awsService: jest.Mocked<AwsService>;

  beforeEach(async () => {
    const mockDbService = {
      userUploadFile: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockAwsService = {
      deleteObjectFromS3: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: AwsService, useValue: mockAwsService },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    dbService = module.get(DatabaseService);
    awsService = module.get(AwsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listFiles', () => {
    it('should call findMany with basic filters', async () => {
      await service.listFiles('user-1');
      expect(dbService.userUploadFile.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { uploadedAt: 'desc' },
      });
    });

    it('should call findMany with type filter', async () => {
      await service.listFiles('user-1', 'image');
      expect(dbService.userUploadFile.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: 'image' },
        orderBy: { uploadedAt: 'desc' },
      });
    });
  });

  describe('deleteFile', () => {
    it('should throw error if file not found or unauthorized', async () => {
      (dbService.userUploadFile.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteFile('user-1', 'file-1')).rejects.toThrow('File not found or not authorized');
    });

    it('should delete from AWS and DB successfully', async () => {
      (dbService.userUploadFile.findUnique as jest.Mock).mockResolvedValue({
        id: 'file-1',
        userId: 'user-1',
        storageUrl: 's3://mock-bucket/mock-key',
      } as any);

      await service.deleteFile('user-1', 'file-1');
      expect(awsService.deleteObjectFromS3).toHaveBeenCalledWith('mock-key');
      expect(dbService.userUploadFile.delete).toHaveBeenCalledWith({ where: { id: 'file-1' } });
    });
  });
});
