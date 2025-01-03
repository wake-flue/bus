/**
 * User 控制器单元测试
 * 测试所有 User 相关的 API 接口处理逻辑
 */
const userController = require('../../../src/controllers/userController');
const userService = require('../../../src/services/userService');
const { UnauthorizedError, NotFoundError } = require('../../../src/utils/apiError');
const mongoose = require('mongoose');

// 模拟 userService
jest.mock('../../../src/services/userService');

// 模拟 catchAsync
jest.mock('../../../src/utils/catchAsync', () => (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
});

describe('UserController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  // 在每个测试前重置 mock 对象
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      locals: {},
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  // 测试用户注册
  describe('register', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'Test123456',
          name: 'Test User'
        }
      };
    });

    it('should register user successfully', async () => {
      const mockUser = { ...mockReq.body, _id: 'mockId' };
      userService.createUser.mockResolvedValue(mockUser);

      await userController.register(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
        message: '创建成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle registration error', async () => {
      const error = new Error('Registration failed');
      userService.createUser.mockRejectedValue(error);

      await userController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试用户登录
  describe('login', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'Test123456'
        },
        headers: {
          'user-agent': 'test-agent'
        },
        ip: '127.0.0.1'
      };
    });

    it('should login successfully', async () => {
      const mockLoginResult = {
        user: { _id: 'mockId', email: mockReq.body.email },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken'
      };
      userService.loginUser.mockResolvedValue(mockLoginResult);

      await userController.login(mockReq, mockRes, mockNext);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockLoginResult.refreshToken,
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockLoginResult.user,
          accessToken: mockLoginResult.accessToken
        },
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      const error = new Error('Login failed');
      userService.loginUser.mockRejectedValue(error);

      await userController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试刷新令牌
  describe('refreshToken', () => {
    beforeEach(() => {
      mockReq = {
        cookies: {
          refreshToken: 'validRefreshToken'
        },
        headers: {
          'user-agent': 'test-agent'
        },
        ip: '127.0.0.1'
      };
    });

    it('should refresh token successfully', async () => {
      const mockResult = {
        accessToken: 'newAccessToken'
      };
      userService.refreshToken.mockResolvedValue(mockResult);

      await userController.refreshToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { accessToken: mockResult.accessToken },
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing refresh token', async () => {
      mockReq.cookies = {};

      await userController.refreshToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockNext.mock.calls[0][0].message).toBe('请先登录');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试退出登录
  describe('logout', () => {
    it('should logout successfully', async () => {
      await userController.logout(mockReq, mockRes, mockNext);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: '退出登录成功' },
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // 测试获取个人信息
  describe('getProfile', () => {
    beforeEach(() => {
      mockReq = {
        user: { id: 'userId' }
      };
    });

    it('should get profile successfully', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        name: 'Test User'
      };
      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle get profile error', async () => {
      const error = new Error('Get profile failed');
      userService.getUserById.mockRejectedValue(error);

      await userController.getProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试更新个人信息
  describe('updateProfile', () => {
    beforeEach(() => {
      mockReq = {
        user: { id: 'userId' },
        body: { name: 'Updated Name' }
      };
    });

    it('should update profile successfully', async () => {
      const mockUpdatedUser = {
        _id: 'userId',
        email: 'test@example.com',
        name: 'Updated Name'
      };
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      await userController.updateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUpdatedUser },
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle update profile error', async () => {
      const error = new Error('Update profile failed');
      userService.updateUser.mockRejectedValue(error);

      await userController.updateProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试修改密码
  describe('changePassword', () => {
    beforeEach(() => {
      mockReq = {
        user: { id: 'userId' },
        body: {
          oldPassword: 'OldPass123',
          newPassword: 'NewPass123'
        }
      };
    });

    it('should change password successfully', async () => {
      const mockResult = { message: '密码修改成功' };
      userService.changePassword.mockResolvedValue(mockResult);

      await userController.changePassword(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle change password error', async () => {
      const error = new Error('Change password failed');
      userService.changePassword.mockRejectedValue(error);

      await userController.changePassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试获取用户列表
  describe('getUsers', () => {
    beforeEach(() => {
      mockReq = {
        query: {}
      };
    });

    it('should get users list successfully', async () => {
      const mockUsers = {
        data: [{ _id: 'userId', email: 'test@example.com' }],
        pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 }
      };
      userService.findWithPagination.mockResolvedValue(mockUsers);

      await userController.getUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle get users error', async () => {
      const error = new Error('Get users failed');
      userService.findWithPagination.mockRejectedValue(error);

      await userController.getUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试获取指定用户信息
  describe('getUser', () => {
    const userId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
      mockReq = {
        params: { id: userId }
      };
    });

    it('should get user successfully', async () => {
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User'
      };
      userService.findById.mockResolvedValue(mockUser);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
        message: '操作成功'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe('用户不存在');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle get user error', async () => {
      const error = new Error('Get user failed');
      userService.findById.mockRejectedValue(error);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
}); 