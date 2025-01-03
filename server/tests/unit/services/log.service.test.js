/**
 * Log 服务层单元测试
 * 测试 Log 服务层的所有业务逻辑功能
 */
const Log = require('../../../src/models/logModel');
const logService = require('../../../src/services/logService');
const mongoose = require('mongoose');

describe('LogService', () => {
  // 每个测试前清空数据库
  beforeEach(async () => {
    await Log.deleteMany({});
  });

  // 测试获取日志列表功能
  describe('findWithPagination', () => {
    // 在测试前准备测试数据
    beforeEach(async () => {
      const now = new Date();
      const logs = [
        {
          level: 'info',
          message: 'First log',
          timestamp: new Date(now.getTime() - 2000),
          meta: {
            source: 'backend',
            operation: 'TEST_1',
            environment: 'development',
            responseInfo: { status: 200 }
          }
        },
        {
          level: 'error',
          message: 'Second log',
          timestamp: new Date(now.getTime() - 1000),
          meta: {
            source: 'frontend',
            operation: 'TEST_2',
            environment: 'production',
            responseInfo: { status: 500 }
          }
        },
        {
          level: 'warn',
          message: 'Third log',
          timestamp: now,
          meta: {
            source: 'backend',
            operation: 'TEST_3',
            environment: 'development',
            responseInfo: { status: 400 }
          }
        },
      ];
      await Log.insertMany(logs);
    });

    it('should get logs with pagination', async () => {
      const result = await logService.findWithPagination({}, { page: 1, pageSize: 2 });
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter logs by level', async () => {
      const result = await logService.findWithPagination({ level: 'error' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].level).toBe('error');
    });

    it('should filter logs by source', async () => {
      const result = await logService.findWithPagination({ source: 'frontend' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].meta.source).toBe('frontend');
    });

    it('should filter logs by status', async () => {
      const result = await logService.findWithPagination({ status: '500' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].meta.responseInfo.status).toBe(500);
    });

    it('should filter logs by time range', async () => {
      const now = new Date();
      const result = await logService.findWithPagination({
        startTime: new Date(now.getTime() - 1500).toISOString(),
        endTime: now.toISOString()
      });
      
      expect(result.data).toHaveLength(2);
    });

    it('should filter logs by search term', async () => {
      const result = await logService.findWithPagination({ search: 'First' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].message).toBe('First log');
    });

    it('should sort logs by timestamp desc by default', async () => {
      const result = await logService.findWithPagination();
      
      expect(result.data[0].message).toBe('Third log');
      expect(result.data[2].message).toBe('First log');
    });
  });

  // 测试创建日志功能
  describe('create', () => {
    it('should create single log successfully', async () => {
      const logData = [{
        level: 'info',
        message: 'Test log',
        meta: {
          source: 'backend',
          operation: 'TEST',
          environment: 'development'
        }
      }];
      
      const logs = await logService.create(logData);
      
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe(logData[0].message);
      expect(logs[0].timestamp).toBeDefined();
    });

    it('should create multiple logs successfully', async () => {
      const logsData = [
        {
          level: 'info',
          message: 'Test log 1',
          meta: {
            source: 'backend',
            environment: 'development'
          }
        },
        {
          level: 'error',
          message: 'Test log 2',
          meta: {
            source: 'frontend',
            environment: 'development'
          }
        }
      ];
      
      const logs = await logService.create(logsData);
      
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe(logsData[0].message);
      expect(logs[1].message).toBe(logsData[1].message);
    });

    it('should set default timestamp if not provided', async () => {
      const logData = [{
        level: 'info',
        message: 'Test log',
        meta: {
          source: 'backend',
          environment: 'development'
        }
      }];
      
      const logs = await logService.create(logData);
      
      expect(logs[0].timestamp).toBeDefined();
      expect(logs[0].timestamp instanceof Date).toBeTruthy();
    });
  });
}); 