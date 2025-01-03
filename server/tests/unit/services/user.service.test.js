/**
 * User 服务层单元测试
 * 测试 User 服务层的所有业务逻辑功能
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/userModel');
const Token = require('../../../src/models/tokenModel');
const userService = require('../../../src/services/userService');
const config = require('../../../src/config');
const { ApiError } = require('../../../src/utils/apiError');

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('token')
}));

describe('UserService', () => {
  let testUser;
  const mockUserData = {
    email: 'test@example.com',
    password: 'Test123456',
    name: 'Test User'
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await Token.deleteMany({});
    testUser = await User.create(mockUserData);
  });

  // 测试创建用户
  describe('createUser', () => {
    it('should create user successfully', async () => {
      const newUserData = {
        email: 'new@example.com',
        password: 'New123456',
        name: 'New User'
      };

      const user = await userService.createUser(newUserData);

      expect(user.email).toBe(newUserData.email);
      expect(user.name).toBe(newUserData.name);
      expect(user.password).toBeUndefined();
    });

    it('should prevent duplicate email registration', async () => {
      const duplicateUserData = {
        email: testUser.email,
        password: 'Test123456',
        name: 'Another User'
      };

      await expect(userService.createUser(duplicateUserData))
        .rejects
        .toThrow('该邮箱已被注册');
    });
  });

  // 测试用户登录
  describe('loginUser', () => {
    it('should login successfully with correct credentials', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await userService.loginUser(
        testUser.email,
        'Test123456',
        'test-agent',
        '127.0.0.1'
      );

      expect(result.user.email).toBe(testUser.email);
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');

      const savedToken = await Token.findOne({ userId: testUser._id });
      expect(savedToken).toBeTruthy();
      expect(savedToken.userAgent).toBe('test-agent');
      expect(savedToken.ipAddress).toBe('127.0.0.1');
    });

    it('should fail with wrong password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(userService.loginUser(
        testUser.email,
        'wrongpassword',
        'test-agent',
        '127.0.0.1'
      )).rejects.toThrow('邮箱或密码错误');
    });

    it('should fail with non-existent email', async () => {
      await expect(userService.loginUser(
        'nonexistent@example.com',
        'Test123456',
        'test-agent',
        '127.0.0.1'
      )).rejects.toThrow('邮箱或密码错误');
    });
  });

  // 测试刷新令牌
  describe('refreshToken', () => {
    let testToken;

    beforeEach(async () => {
      testToken = await Token.create({
        userId: testUser._id,
        token: 'validRefreshToken',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1'
      });
    });

    it('should refresh token successfully', async () => {
      const result = await userService.refreshToken(
        testToken.token,
        'test-agent',
        '127.0.0.1'
      );

      expect(result.accessToken).toBe('token');
    });

    it('should fail with invalid refresh token', async () => {
      await expect(userService.refreshToken(
        'invalidToken',
        'test-agent',
        '127.0.0.1'
      )).rejects.toThrow('无效的刷新令牌');
    });

    it('should fail with expired refresh token', async () => {
      await Token.findByIdAndUpdate(testToken._id, {
        expires: new Date(Date.now() - 1000)
      });

      await expect(userService.refreshToken(
        testToken.token,
        'test-agent',
        '127.0.0.1'
      )).rejects.toThrow('无效的刷新令牌');
    });
  });

  // 测试获取用户信息
  describe('getUserById', () => {
    it('should get user successfully', async () => {
      const user = await userService.getUserById(testUser._id);

      expect(user._id).toEqual(testUser._id);
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
    });

    it('should fail with non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(userService.getUserById(nonExistentId))
        .rejects
        .toThrow('用户不存在');
    });
  });

  // 测试更新用户信息
  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const updatedUser = await userService.updateUser(testUser._id, updateData);

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(testUser.email);
    });

    it('should not update sensitive fields', async () => {
      const updateData = {
        password: 'NewPassword123',
        role: 'admin'
      };

      const updatedUser = await userService.updateUser(testUser._id, updateData);

      expect(updatedUser.role).toBe('user');
    });

    it('should fail with non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(userService.updateUser(nonExistentId, { name: 'New Name' }))
        .rejects
        .toThrow('用户不存在');
    });
  });

  // 测试修改密码
  describe('changePassword', () => {
    beforeEach(() => {
      bcrypt.compare.mockReset();
    });

    it('should change password successfully', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await userService.changePassword(
        testUser._id,
        'Test123456',
        'NewTest123456'
      );

      expect(result.message).toBe('密码修改成功');

      const tokens = await Token.find({ userId: testUser._id });
      expect(tokens.every(token => token.isRevoked)).toBe(true);
    });

    it('should fail with wrong old password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(userService.changePassword(
        testUser._id,
        'wrongpassword',
        'NewTest123456'
      )).rejects.toThrow('原密码错误');
    });

    it('should fail with non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(userService.changePassword(
        nonExistentId,
        'Test123456',
        'NewTest123456'
      )).rejects.toThrow('用户不存在');
    });
  });

  // 测试分页查询
  describe('findWithPagination', () => {
    beforeEach(async () => {
      // 确保清理所有数据
      await User.deleteMany({});
      
      // 按顺序创建测试数据
      await User.create({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        createdAt: new Date('2023-01-01')
      });
      
      await User.create({
        email: 'user1@example.com',
        password: 'Test123456',
        name: 'User 1',
        createdAt: new Date('2023-01-02')
      });
      
      await User.create({
        email: 'user2@example.com',
        password: 'Test123456',
        name: 'User 2',
        createdAt: new Date('2023-01-03')
      });
    });

    it('should get users with pagination', async () => {
      const result = await userService.findWithPagination({}, { page: 1, pageSize: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter users by email', async () => {
      const result = await userService.findWithPagination({ email: 'user1@example.com' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('user1@example.com');
    });

    it('should sort users by specified field', async () => {
      const result = await userService.findWithPagination({}, { 
        sortBy: 'email',
        sortOrder: 'asc',
        page: 1,
        pageSize: 10
      });

      const emails = result.data.map(user => user.email);
      expect(emails).toEqual(['test@example.com', 'user1@example.com', 'user2@example.com']);
    });
  });
}); 