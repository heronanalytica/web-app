import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import { FeatureFlagService } from 'src/feature-flag/feature-flag.service';
import { ForbiddenException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let dbService: jest.Mocked<DatabaseService>;
  let jwtService: jest.Mocked<JwtService>;
  let featureFlagService: jest.Mocked<FeatureFlagService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'CLIENT',
  };

  beforeEach(async () => {
    const mockDbService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockFeatureFlagService = {
      isEnabled: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dbService = module.get(DatabaseService);
    jwtService = module.get(JwtService);
    featureFlagService = module.get(FeatureFlagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw ForbiddenException if authentication is disabled', async () => {
      featureFlagService.isEnabled.mockResolvedValue(false);
      await expect(
        service.signup({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if email is already in use', async () => {
      featureFlagService.isEnabled.mockResolvedValue(true);
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);

      await expect(
        service.signup({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully sign up a new user', async () => {
      featureFlagService.isEnabled.mockResolvedValue(true);
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      (dbService.user.create as jest.Mock).mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.signup({
        email: 'test@example.com',
        password: 'password',
      });

      expect(dbService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'new-hashed-password',
        },
      });
      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: { id: 'user-id', email: 'test@example.com' },
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      featureFlagService.isEnabled.mockResolvedValue(true);
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      featureFlagService.isEnabled.mockResolvedValue(true);
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully log in a user', async () => {
      featureFlagService.isEnabled.mockResolvedValue(true);
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: { id: 'user-id', email: 'test@example.com', role: 'CLIENT' },
      });
    });
  });

  describe('adminResetPassword', () => {
    it('should throw ForbiddenException if user is not admin', async () => {
      const currentUser = { id: 'admin-id', email: 'admin@test.com', role: 'CLIENT' };
      await expect(
        service.adminResetPassword(currentUser, { userId: 'target-id', newPassword: 'new' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if target user is not found', async () => {
      const currentUser = { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' };
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.adminResetPassword(currentUser, { userId: 'target-id', newPassword: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully reset password', async () => {
      const currentUser = { id: 'admin-id', email: 'admin@test.com', role: 'ADMIN' };
      (dbService.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.adminResetPassword(currentUser, {
        userId: 'target-id',
        newPassword: 'new-password',
      });

      expect(dbService.user.update).toHaveBeenCalledWith({
        where: { id: 'target-id' },
        data: { password: 'new-hash' },
      });
      expect(result).toEqual({ message: 'Password reset successfully' });
    });
  });
});
