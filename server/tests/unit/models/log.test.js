/**
 * Log 模型单元测试
 * 测试 Log 模型的基本功能，包括创建、验证和更新机制
 */
const Log = require('../../../src/models/logModel');
const mongoose = require('mongoose');

describe('Log Model Test', () => {
  // 测试创建和保存日志的基本功能
  it('should create & save log successfully', async () => {
    const validLog = {
      level: 'info',
      message: 'Test log message',
      meta: {
        source: 'backend',
        operation: 'TEST_OPERATION',
        environment: 'development'
      }
    };
    
    const log = new Log(validLog);
    const savedLog = await log.save();
    
    expect(savedLog._id).toBeDefined();
    expect(savedLog.level).toBe(validLog.level);
    expect(savedLog.message).toBe(validLog.message);
    expect(savedLog.meta.source).toBe(validLog.meta.source);
    expect(savedLog.meta.operation).toBe(validLog.meta.operation);
    expect(savedLog.timestamp).toBeDefined();
  });

  // 测试缺少必填字段时的验证
  it('should fail to save log without required fields', async () => {
    const logWithoutMessage = new Log({
      level: 'info',
      meta: {
        source: 'backend',
        environment: 'development'
      }
    });
    
    let err;
    try {
      await logWithoutMessage.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.message).toBeDefined();
  });

  // 测试无效的日志级别
  it('should fail to save log with invalid level', async () => {
    const logWithInvalidLevel = new Log({
      level: 'invalid_level',
      message: 'Test message',
      meta: {
        source: 'backend',
        environment: 'development'
      }
    });
    
    let err;
    try {
      await logWithInvalidLevel.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.level).toBeDefined();
  });

  // 测试无效的源
  it('should fail to save log with invalid source', async () => {
    const logWithInvalidSource = new Log({
      level: 'info',
      message: 'Test message',
      meta: {
        source: 'invalid_source',
        environment: 'development'
      }
    });
    
    let err;
    try {
      await logWithInvalidSource.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['meta.source']).toBeDefined();
  });

  // 测试无效的环境
  it('should fail to save log with invalid environment', async () => {
    const logWithInvalidEnv = new Log({
      level: 'info',
      message: 'Test message',
      meta: {
        source: 'backend',
        environment: 'invalid_env'
      }
    });
    
    let err;
    try {
      await logWithInvalidEnv.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['meta.environment']).toBeDefined();
  });

  // 测试时间戳默认值
  it('should set default timestamp on save', async () => {
    const log = new Log({
      level: 'info',
      message: 'Test message',
      meta: {
        source: 'backend',
        environment: 'development'
      }
    });
    
    const savedLog = await log.save();
    expect(savedLog.timestamp).toBeDefined();
    expect(savedLog.timestamp instanceof Date).toBeTruthy();
  });
}); 