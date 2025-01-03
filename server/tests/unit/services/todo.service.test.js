/**
 * Todo 服务层单元测试
 * 测试 Todo 服务层的所有业务逻辑功能
 */
const Todo = require('../../../src/models/todoModel');
const todoService = require('../../../src/services/todoService');
const mongoose = require('mongoose');

describe('TodoService', () => {
  // 每个测试前清空数据库
  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  // 测试获取 Todo 列表功能
  describe('findWithPagination', () => {
    // 在测试前准备测试数据
    beforeEach(async () => {
      const now = new Date();
      const todos = [
        { 
          title: 'First Todo', 
          completed: false,
          createdAt: new Date(now.getTime() - 2000)
        },
        { 
          title: 'Second Todo', 
          completed: true,
          createdAt: new Date(now.getTime() - 1000)
        },
        { 
          title: 'Third Todo', 
          completed: false,
          createdAt: now
        },
      ];
      await Todo.insertMany(todos);
    });

    it('should get todos with pagination', async () => {
      const result = await todoService.findWithPagination({}, { page: 1, pageSize: 2 });
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter todos by completed status', async () => {
      const result = await todoService.findWithPagination({ completed: 'true' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].completed).toBe(true);
    });

    it('should filter todos by title search', async () => {
      const result = await todoService.findWithPagination({ title: 'First' });
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('First Todo');
    });

    it('should sort todos by createdAt desc by default', async () => {
      const result = await todoService.findWithPagination();
      
      expect(result.data[0].title).toBe('Third Todo');
      expect(result.data[2].title).toBe('First Todo');
    });

    it('should sort todos by specified field and order', async () => {
      const result = await todoService.findWithPagination({}, { sortBy: 'title', sortOrder: 'asc' });
      
      expect(result.data[0].title).toBe('First Todo');
      expect(result.data[2].title).toBe('Third Todo');
    });
  });

  // 测试创建 Todo 功能
  describe('create', () => {
    it('should create todo successfully', async () => {
      const todoData = { title: 'New Todo', completed: true };
      const todo = await todoService.create(todoData);
      
      expect(todo.title).toBe(todoData.title);
      expect(todo.completed).toBe(todoData.completed);
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });

    it('should create todo with default completed status', async () => {
      const todoData = { title: 'New Todo' };
      const todo = await todoService.create(todoData);
      
      expect(todo.completed).toBe(false);
    });
  });

  // 测试更新 Todo 功能
  describe('update', () => {
    let existingTodo;

    beforeEach(async () => {
      existingTodo = await Todo.create({ title: 'Original Todo' });
    });

    it('should update todo successfully', async () => {
      const updateData = { title: 'Updated Todo', completed: true };
      const updatedTodo = await todoService.update(existingTodo._id, updateData);
      
      expect(updatedTodo.title).toBe(updateData.title);
      expect(updatedTodo.completed).toBe(updateData.completed);
    });

    it('should partially update todo', async () => {
      const updateData = { completed: true };
      const updatedTodo = await todoService.update(existingTodo._id, updateData);
      
      expect(updatedTodo.title).toBe(existingTodo.title);
      expect(updatedTodo.completed).toBe(true);
    });

    it('should return null for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updatedTodo = await todoService.update(nonExistentId, { title: 'New Title' });
      
      expect(updatedTodo).toBeNull();
    });
  });

  // 测试删除 Todo 功能
  describe('delete', () => {
    let existingTodo;

    beforeEach(async () => {
      existingTodo = await Todo.create({ title: 'Todo to Delete' });
    });

    it('should delete todo successfully', async () => {
      const deletedTodo = await todoService.delete(existingTodo._id);
      const foundTodo = await Todo.findById(existingTodo._id);
      
      expect(deletedTodo._id).toEqual(existingTodo._id);
      expect(foundTodo).toBeNull();
    });

    it('should return null for non-existent todo', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const deletedTodo = await todoService.delete(nonExistentId);
      
      expect(deletedTodo).toBeNull();
    });
  });
}); 