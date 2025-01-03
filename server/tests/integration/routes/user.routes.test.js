/**
 * User 路由集成测试
 * 测试所有 User 相关的路由端点的实际功能
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const User = require('../../../src/models/userModel');
const Token = require('../../../src/models/tokenModel');
const config = require('../../../src/config');

const { apiVersion } = config.app;
const API_PREFIX = `/api/${apiVersion}`;

describe('User Routes Integration Tests', () => {
  let testUser;
  let adminUser;
  let accessToken;
  let adminAccessToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Token.deleteMany({});

    // 创建测试用户
    testUser = await User.create({
      email: 'test@example.com',
      password: 'Test123456',
      name: 'Test User'
    });

    // 创建管理员用户
    adminUser = await User.create({
      email: 'admin@example.com',
      password: 'Admin123456',
      name: 'Admin User',
      role: 'admin'
    });

    // 登录获取token
    const userLoginResponse = await request(app)
      .post(`${API_PREFIX}/users/login`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: 'test@example.com',
        password: 'Test123456'
      });

    if (!userLoginResponse.body.data || !userLoginResponse.body.data.accessToken) {
      console.log('User login response:', userLoginResponse.body);
      throw new Error('Failed to get user access token');
    }
    accessToken = userLoginResponse.body.data.accessToken;

    const adminLoginResponse = await request(app)
      .post(`${API_PREFIX}/users/login`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: 'admin@example.com',
        password: 'Admin123456'
      });

    if (!adminLoginResponse.body.data || !adminLoginResponse.body.data.accessToken) {
      console.log('Admin login response:', adminLoginResponse.body);
      throw new Error('Failed to get admin access token');
    }
    adminAccessToken = adminLoginResponse.body.data.accessToken;
  });

  // 测试用户注册
  describe('POST /users/register', () => {
    it('should register user successfully', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'New123456',
        name: 'New User'
      };

      const response = await request(app)
        .post(`${API_PREFIX}/users/register`)
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('创建成功');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.name).toBe(newUser.name);
      expect(response.body.data.user.password).toBeUndefined();

      const savedUser = await User.findOne({ email: newUser.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(newUser.name);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/users/register`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('验证失败');
    });

    it('should prevent duplicate email registration', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/users/register`)
        .send({
          email: testUser.email,
          password: 'Test123456',
          name: 'Another User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('邮箱已被注册');
    });
  });

  // 测试用户登录
  describe('POST /users/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/users/login`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: testUser.email,
          password: 'Test123456'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.accessToken).toBeTruthy();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/users/login`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('邮箱或密码错误');
    });
  });

  // 测试刷新令牌
  describe('POST /users/refresh-token', () => {
    it('should refresh token successfully', async () => {
      const loginResponse = await request(app)
        .post(`${API_PREFIX}/users/login`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: testUser.email,
          password: 'Test123456'
        });

      const refreshTokenCookie = loginResponse.headers['set-cookie'];

      const response = await request(app)
        .post(`${API_PREFIX}/users/refresh-token`)
        .set('Cookie', refreshTokenCookie)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeTruthy();
    });

    it('should fail without refresh token', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/users/refresh-token`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('请先登录');
    });
  });

  // 测试获取个人信息
  describe('GET /users/profile', () => {
    it('should get profile successfully', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('请先登录');
    });
  });

  // 测试更新个人信息
  describe('PATCH /users/profile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .patch(`${API_PREFIX}/users/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.name).toBe(updateData.name);
    });
  });

  // 测试修改密码
  describe('POST /users/change-password', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        oldPassword: 'Test123456',
        newPassword: 'NewTest123456'
      };

      const response = await request(app)
        .post(`${API_PREFIX}/users/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('密码修改成功');

      // 验证新密码可以登录
      const loginResponse = await request(app)
        .post(`${API_PREFIX}/users/login`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: testUser.email,
          password: passwordData.newPassword
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should fail with wrong old password', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/users/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'NewTest123456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('原密码错误');
    });
  });

  // 测试管理员获取用户列表
  describe('GET /users', () => {
    it('should get users list as admin', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.sort).toBeDefined();
    });

    it('should fail for non-admin user', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无权限');
    });
  });

  // 测试管理员获取指定用户
  describe('GET /users/:id', () => {
    it('should get user detail as admin', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should fail for non-admin user', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users/${testUser._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无权限');
    });

    it('should handle non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${API_PREFIX}/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户不存在');
    });
  });
}); 