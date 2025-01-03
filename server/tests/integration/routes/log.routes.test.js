/**
 * Log 路由集成测试
 * 测试所有 Log 相关的路由端点的实际功能
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const Log = require('../../../src/models/logModel');
const config = require('../../../src/config');

const { apiVersion } = config.app;
const API_PREFIX = `/api/${apiVersion}`;

describe('Log Routes Integration Tests', () => {
  let testLog;

  beforeEach(async () => {
    await Log.deleteMany({});
    testLog = await Log.create({
      level: 'info',
      message: 'Test log',
      timestamp: new Date(),
      meta: {
        source: 'backend',
        operation: 'TEST',
        environment: 'development',
        responseInfo: { status: 200 }
      }
    });
  });

  // 测试获取日志列表
  describe('GET /logs', () => {
    it('should get logs list successfully', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/logs`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('操作成功');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].message).toBe('Test log');
    });

    it('should handle pagination correctly', async () => {
      await Log.create([
        {
          level: 'error',
          message: 'Error log',
          meta: {
            source: 'backend',
            environment: 'development',
            responseInfo: { status: 500 }
          }
        },
        {
          level: 'warn',
          message: 'Warning log',
          meta: {
            source: 'frontend',
            environment: 'development',
            responseInfo: { status: 400 }
          }
        }
      ]);

      const response = await request(app)
        .get(`${API_PREFIX}/logs`)
        .query({ page: 1, pageSize: 2 })
        .expect(200);

      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter logs by level', async () => {
      await Log.create({
        level: 'error',
        message: 'Error log',
        meta: {
          source: 'backend',
          environment: 'development'
        }
      });

      const response = await request(app)
        .get(`${API_PREFIX}/logs`)
        .query({ level: 'error' })
        .expect(200);

      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].level).toBe('error');
    });

    it('should filter logs by time range', async () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 1000);
      const endTime = new Date(now.getTime() + 1000);

      const response = await request(app)
        .get(`${API_PREFIX}/logs`)
        .query({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(200);

      expect(response.body.data.data).toHaveLength(1);
    });

    it('should filter logs by source', async () => {
      await Log.create({
        level: 'info',
        message: 'Frontend log',
        meta: {
          source: 'frontend',
          environment: 'development'
        }
      });

      const response = await request(app)
        .get(`${API_PREFIX}/logs`)
        .query({ source: 'frontend' })
        .expect(200);

      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].meta.source).toBe('frontend');
    });
  });

  // 测试创建日志
  describe('POST /logs', () => {
    it('should create single log successfully', async () => {
      const newLog = [{
        level: 'info',
        message: 'New log',
        meta: {
          source: 'backend',
          operation: 'TEST_CREATE',
          environment: 'development'
        }
      }];

      const response = await request(app)
        .post(`${API_PREFIX}/logs`)
        .send(newLog)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('创建成功');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].message).toBe(newLog[0].message);

      const savedLog = await Log.findById(response.body.data[0]._id);
      expect(savedLog).toBeTruthy();
      expect(savedLog.message).toBe(newLog[0].message);
    });

    it('should create multiple logs successfully', async () => {
      const newLogs = [
        {
          level: 'info',
          message: 'First new log',
          meta: {
            source: 'backend',
            environment: 'development'
          }
        },
        {
          level: 'error',
          message: 'Second new log',
          meta: {
            source: 'frontend',
            environment: 'development'
          }
        }
      ];

      const response = await request(app)
        .post(`${API_PREFIX}/logs`)
        .send(newLogs)
        .expect(201);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].message).toBe(newLogs[0].message);
      expect(response.body.data[1].message).toBe(newLogs[1].message);

      const savedLogs = await Log.find({
        message: { $in: newLogs.map(log => log.message) }
      });
      expect(savedLogs).toHaveLength(2);
    });

    it('should handle invalid request body', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/logs`)
        .send('invalid body')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('日志格式错误, 应为数组');
    });

    it('should handle validation errors', async () => {
      const invalidLog = [{
        level: 'invalid_level',
        message: 'Invalid log',
        meta: {
          source: 'backend',
          environment: 'development'
        }
      }];

      const response = await request(app)
        .post(`${API_PREFIX}/logs`)
        .send(invalidLog)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('验证失败');
    });
  });

  // 测试获取日志详情
  describe('GET /logs/:id', () => {
    it('should get log detail successfully', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/logs/${testLog._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('操作成功');
      expect(response.body.data.message).toBe('Test log');
      expect(response.body.data.level).toBe('info');
      expect(response.body.data.meta.source).toBe('backend');
    });

    it('should handle non-existent log', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`${API_PREFIX}/logs/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('资源不存在');
    });

    it('should handle invalid log id', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/logs/invalid-id`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无效的ID格式');
    });
  });
}); 