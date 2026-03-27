import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    role: 'CLIENT' as any,
  };

  beforeEach(async () => {
    const mockAuthService = {
      signup: jest.fn(),
      login: jest.fn(),
      adminResetPassword: jest.fn(),
    };

    const mockDbService = {}; // Mock db service if needed by controller

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return signup success response', async () => {
      authService.signup.mockResolvedValue({
        accessToken: 'token',
        user: mockUser,
      });

      const result = await controller.signup({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        message: 'Signup successful',
        data: { accessToken: 'token', user: mockUser },
      });
    });
  });

  describe('login', () => {
    it('should return login success response and set cookie', async () => {
      authService.login.mockResolvedValue({
        accessToken: 'token',
        user: mockUser,
      });

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(
        { email: 'test@example.com', password: 'password' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith('login_token', 'token', expect.any(Object));
      expect(result).toEqual({
        message: 'Login successful',
        data: { accessToken: 'token', user: mockUser },
      });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return success message', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('login_token', { path: '/' });
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });

  describe('getMe', () => {
    it('should return authenticated user', () => {
      const req = {
        user: mockUser as any,
      } as unknown as Request;

      const result = controller.getMe(req);
      expect(result).toEqual({
        message: 'Authenticated user',
        data: mockUser,
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw UnauthorizedException if no current user', async () => {
      const req = { user: undefined } as unknown as Request;
      await expect(
        controller.resetPassword(req, { userId: '1', newPassword: 'new' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call authService.adminResetPassword on success', async () => {
      const req = { user: mockUser } as unknown as Request;
      authService.adminResetPassword.mockResolvedValue({ message: 'Password reset successfully' });

      const result = await controller.resetPassword(req, { userId: '1', newPassword: 'new' });
      expect(authService.adminResetPassword).toHaveBeenCalledWith(mockUser, {
        userId: '1',
        newPassword: 'new',
      });
      expect(result).toEqual({ message: 'Password reset successfully' });
    });
  });
});
