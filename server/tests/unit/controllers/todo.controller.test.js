/**
 * Todo 控制器单元测试
 * 测试所有 Todo 相关的 API 接口处理逻辑
 */
const todoController = require('../../../src/controllers/todoController');
const todoService = require('../../../src/services/todoService');
const { NotFoundError } = require('../../../src/utils/apiError');
const mongoose = require('mongoose');

// 模拟 todoService
jest.mock('../../../src/services/todoService');

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

describe('TodoController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  // 在每个测试前重置 mock 对象
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  // 测试获取 Todo 列表接口
  describe('list', () => {
    beforeEach(() => {
      mockReq = {
        query: {},
      };
    });

    it('should get todos list successfully', async () => {
      const mockTodos = {
        data: [{ title: 'Test Todo', completed: false }],
        pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
      };
      todoService.findWithPagination.mockResolvedValue(mockTodos);

      await todoController.list(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodos,
        message: '操作成功',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle error when getting todos fails', async () => {
      const error = new Error('Database error');
      todoService.findWithPagination.mockRejectedValue(error);

      await todoController.list(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试创建 Todo 接口
  describe('create', () => {
    beforeEach(() => {
      mockReq = {
        body: { title: 'New Todo' },
      };
    });

    it('should create todo successfully', async () => {
      const mockTodo = { _id: 'mockId', ...mockReq.body };
      todoService.create.mockResolvedValue(mockTodo);

      await todoController.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
        message: '创建成功',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle error when creating todo fails', async () => {
      const error = new Error('Validation error');
      todoService.create.mockRejectedValue(error);

      await todoController.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试更新 Todo 接口
  describe('update', () => {
    const todoId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
      mockReq = {
        params: { id: todoId },
        body: { title: 'Updated Todo' },
      };
    });

    it('should update todo successfully', async () => {
      const mockTodo = { _id: todoId, ...mockReq.body };
      todoService.update.mockResolvedValue(mockTodo);

      await todoController.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
        message: '操作成功',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle not found error', async () => {
      todoService.update.mockResolvedValue(null);

      await todoController.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe('资源不存在');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle error when updating todo fails', async () => {
      const error = new Error('Database error');
      todoService.update.mockRejectedValue(error);

      await todoController.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试删除 Todo 接口
  describe('delete', () => {
    const todoId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
      mockReq = {
        params: { id: todoId },
      };
    });

    it('should delete todo successfully', async () => {
      const mockTodo = { _id: todoId };
      todoService.delete.mockResolvedValue(mockTodo);

      await todoController.delete(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: '操作成功',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle not found error', async () => {
      todoService.delete.mockResolvedValue(null);

      await todoController.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe('资源不存在');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle error when deleting todo fails', async () => {
      const error = new Error('Database error');
      todoService.delete.mockRejectedValue(error);

      await todoController.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // 测试获取Todo详情接口
  describe('detail', () => {
    const todoId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
      mockReq = {
        params: { id: todoId },
      };
    });

    it('should get todo detail successfully', async () => {
      const mockTodo = { _id: todoId, title: 'Test Todo', completed: false };
      todoService.findById.mockResolvedValue(mockTodo);

      await todoController.detail(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo,
        message: '操作成功',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle not found error', async () => {
      todoService.findById.mockResolvedValue(null);

      await todoController.detail(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe('资源不存在');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle error when getting todo fails', async () => {
      const error = new Error('Database error');
      todoService.findById.mockRejectedValue(error);

      await todoController.detail(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
}); 