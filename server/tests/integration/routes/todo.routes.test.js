/**
 * Todo 路由集成测试
 * 测试所有 Todo 相关的路由端点的实际功能
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const Todo = require('../../../src/models/todoModel');
const config = require('../../../src/config');

const { apiVersion } = config.app;
const API_PREFIX = `/api/${apiVersion}`;

describe('Todo Routes Integration Tests', () => {
  let testTodo;

  beforeEach(async () => {
    await Todo.deleteMany({});
    testTodo = await Todo.create({
      title: 'Test Todo',
      completed: false
    });
  });

  // 测试获取待办事项列表
  describe('GET /todos', () => {
    it('should get todos list successfully', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/todos`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('操作成功');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].title).toBe('Test Todo');
    });

    it('should handle pagination correctly', async () => {
      await Todo.create([
        { title: 'Todo 2', completed: false },
        { title: 'Todo 3', completed: true }
      ]);

      const response = await request(app)
        .get(`${API_PREFIX}/todos`)
        .query({ page: 1, pageSize: 2 })
        .expect(200);

      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter todos by completed status', async () => {
      await Todo.create({ title: 'Completed Todo', completed: true });

      const response = await request(app)
        .get(`${API_PREFIX}/todos`)
        .query({ completed: 'true' })
        .expect(200);

      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].completed).toBe(true);
    });

    it('should sort todos by specified field', async () => {
      await Todo.create([
        { title: 'A Todo', completed: false },
        { title: 'B Todo', completed: true }
      ]);

      const response = await request(app)
        .get(`${API_PREFIX}/todos`)
        .query({ sortBy: 'title', sortOrder: 'asc' })
        .expect(200);

      expect(response.body.data.data[0].title).toBe('A Todo');
      expect(response.body.data.data[1].title).toBe('B Todo');
      expect(response.body.data.data[2].title).toBe('Test Todo');
    });
  });

  // 测试创建待办事项
  describe('POST /todos', () => {
    it('should create todo successfully', async () => {
      const newTodo = {
        title: 'New Todo',
        completed: false
      };

      const response = await request(app)
        .post(`${API_PREFIX}/todos`)
        .send(newTodo)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('创建成功');
      expect(response.body.data.title).toBe(newTodo.title);
      expect(response.body.data.completed).toBe(newTodo.completed);

      const savedTodo = await Todo.findById(response.body.data._id);
      expect(savedTodo).toBeTruthy();
      expect(savedTodo.title).toBe(newTodo.title);
    });

    it('should validate required title field', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/todos`)
        .send({ completed: false })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('标题');
    });
  });

  // 测试更新待办事项
  describe('PUT /todos/:id', () => {
    it('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Todo',
        completed: true
      };

      const response = await request(app)
        .put(`${API_PREFIX}/todos/${testTodo._id}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('操作成功');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.completed).toBe(updateData.completed);

      const updatedTodo = await Todo.findById(testTodo._id);
      expect(updatedTodo.title).toBe(updateData.title);
      expect(updatedTodo.completed).toBe(updateData.completed);
    });

    it('should handle non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`${API_PREFIX}/todos/${nonExistentId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('资源不存在');
    });
  });

  // 测试删除待办事项
  describe('DELETE /todos/:id', () => {
    it('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`${API_PREFIX}/todos/${testTodo._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('操作成功');

      const deletedTodo = await Todo.findById(testTodo._id);
      expect(deletedTodo).toBeNull();
    });

    it('should handle non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`${API_PREFIX}/todos/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('资源不存在');
    });
  });

  // 测试获取待办详情
  describe('GET /todos/:id', () => {
    it('should get todo detail successfully', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/todos/${testTodo._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('操作成功');
      expect(response.body.data.title).toBe('Test Todo');
      expect(response.body.data.completed).toBe(false);
    });

    it('should handle non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`${API_PREFIX}/todos/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('资源不存在');
    });

    it('should handle invalid todo id', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/todos/invalid-id`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('无效的ID格式');
    });
  });
}); 