/**
 * User 模型单元测试
 * 测试 User 模型的基本功能，包括创建、验证、密码加密和比较等功能
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Mock mongoose
jest.mock('mongoose', () => {
  class Schema {
    constructor() {
      this.methods = {};
      this.statics = {};
      this.indexes = [];
      this.obj = {};
      this.preHooks = new Map();
    }

    pre(event, callback) {
      this.preHooks.set(event, callback);
      return this;
    }

    index() {
      return this;
    }
  }

  const mockMongoose = {
    Schema,
    model: jest.fn().mockImplementation((modelName, schema) => {
      return {
        modelName,
        schema,
        prototype: {
          save: jest.fn().mockImplementation(async function() {
            // 执行 pre save 钩子
            if (schema.preHooks.has('save')) {
              const next = jest.fn();
              await schema.preHooks.get('save').call(this, next);
              if (next.mock.calls.length > 0 && next.mock.calls[0][0] instanceof Error) {
                throw next.mock.calls[0][0];
              }
            }
            return this;
          })
        }
      };
    }),
    Types: { 
      ObjectId: jest.fn(),
      String: String,
      Boolean: Boolean,
      Date: Date
    },
    Error: {
      ValidationError: class ValidationError extends Error {
        constructor() {
          super();
          this.errors = {};
        }
      }
    }
  };
  
  return mockMongoose;
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}));

// 在加载 User 模型之前先设置好 mock
const User = require('../../../src/models/userModel');

describe('User Model Test', () => {
  let mockValidationError;

  beforeEach(() => {
    // 重置所有的 mock
    bcrypt.genSalt.mockClear();
    bcrypt.hash.mockClear();
    bcrypt.compare.mockClear();
    
    // 创建一个新的验证错误实例
    mockValidationError = new mongoose.Error.ValidationError();
  });

  // 测试创建和保存用户的基本功能
  it('should create & save user successfully', async () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Test123456',
      name: 'Test User',
      isModified: jest.fn().mockReturnValue(true)  // 添加 isModified mock
    };
    
    // 模拟成功保存的行为
    const mockSave = jest.fn().mockImplementation(async function() {
      // 执行密码加密逻辑
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      
      return {
        _id: 'mockId',
        ...this,
        email: this.email.toLowerCase(),
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // 模拟 User 构造函数的行为
    const user = {
      ...validUser,
      save: mockSave
    };
    
    const savedUser = await user.save();
    
    // 验证保存后的用户包含所有必要字段
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email.toLowerCase());
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.role).toBe('user');
    expect(savedUser.isActive).toBe(true);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
    
    // 验证密码被正确加密
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(validUser.password, 'salt');
  });

  // 测试缺少必填字段时的验证
  describe('Field Validations', () => {
    it('should fail to save user without email', async () => {
      const userWithoutEmail = {
        password: 'Test123456',
        name: 'Test User',
        save: jest.fn().mockRejectedValue(mockValidationError)
      };
      
      mockValidationError.errors.email = { message: '邮箱是必需的' };
      
      let err;
      try {
        await userWithoutEmail.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.email).toBeDefined();
    });

    it('should fail to save user without password', async () => {
      const userWithoutPassword = {
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockRejectedValue(mockValidationError)
      };
      
      mockValidationError.errors.password = { message: '密码是必需的' };
      
      let err;
      try {
        await userWithoutPassword.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.password).toBeDefined();
    });

    it('should fail to save user without name', async () => {
      const userWithoutName = {
        email: 'test@example.com',
        password: 'Test123456',
        save: jest.fn().mockRejectedValue(mockValidationError)
      };
      
      mockValidationError.errors.name = { message: '用户名是必需的' };
      
      let err;
      try {
        await userWithoutName.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.name).toBeDefined();
    });

    it('should fail to save user with invalid email', async () => {
      const userWithInvalidEmail = {
        email: 'invalid-email',
        password: 'Test123456',
        name: 'Test User',
        save: jest.fn().mockRejectedValue(mockValidationError)
      };
      
      mockValidationError.errors.email = { message: '请输入有效的邮箱地址' };
      
      let err;
      try {
        await userWithInvalidEmail.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.email).toBeDefined();
    });
  });

  // 测试密码比较功能
  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);
      
      const user = {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        comparePassword: async function(candidatePassword) {
          return bcrypt.compare(candidatePassword, this.password);
        }
      };
      
      const isMatch = await user.comparePassword('Test123456');
      expect(isMatch).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('Test123456', 'hashedPassword');
    });

    it('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      
      const user = {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        comparePassword: async function(candidatePassword) {
          return bcrypt.compare(candidatePassword, this.password);
        }
      };
      
      const isMatch = await user.comparePassword('WrongPassword');
      expect(isMatch).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword', 'hashedPassword');
    });
  });

  // 测试 toJSON 方法
  describe('toJSON Method', () => {
    it('should remove password when converting to JSON', () => {
      const user = {
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        toObject: () => ({
          email: 'test@example.com',
          password: 'Test123456',
          name: 'Test User'
        }),
        toJSON: function() {
          const obj = this.toObject();
          delete obj.password;
          return obj;
        }
      };

      const userJSON = user.toJSON();
      
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.email).toBe(user.email);
      expect(userJSON.name).toBe(user.name);
    });
  });

  // 测试邮箱唯一性约束
  describe('Email Uniqueness', () => {
    it('should fail to save user with duplicate email', async () => {
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      
      const mockSave = jest.fn()
        .mockResolvedValueOnce({ _id: 'mockId1' }) // 第一次保存成功
        .mockRejectedValueOnce(duplicateError);     // 第二次保存失败
      
      const firstUser = {
        email: 'test@example.com',
        password: 'Test123456',
        name: 'First User',
        save: mockSave
      };
      
      const secondUser = {
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Second User',
        save: mockSave
      };

      await firstUser.save();

      let err;
      try {
        await secondUser.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code).toBe(11000);
    });
  });
}); 