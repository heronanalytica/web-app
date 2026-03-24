import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseService } from 'src/database/database.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let dbService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockDbService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    dbService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        strategy.validate({ sub: 'user-id', email: 'test@example.com' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return sanitized user object if valid', async () => {
      (dbService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        password: 'hashed-password',
      } as any);

      const result = await strategy.validate({ sub: 'user-id', email: 'test@example.com' });
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      });
    });
  });
});
