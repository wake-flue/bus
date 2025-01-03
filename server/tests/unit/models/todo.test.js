/**
 * Todo 模型单元测试
 * 测试 Todo 模型的基本功能，包括创建、验证和更新机制
 */
const Todo = require('../../../src/models/todoModel');
const mongoose = require('mongoose');

describe('Todo Model Test', () => {
  // 测试创建和保存 Todo 的基本功能
  it('should create & save todo successfully', async () => {
    // 创建一个有效的 Todo 数据
    const validTodo = {
      title: 'Test Todo',
      completed: false
    };
    
    const todo = new Todo(validTodo);
    const savedTodo = await todo.save();
    
    // 验证保存后的 Todo 包含所有必要字段
    expect(savedTodo._id).toBeDefined();
    expect(savedTodo.title).toBe(validTodo.title);
    expect(savedTodo.completed).toBe(validTodo.completed);
    expect(savedTodo.createdAt).toBeDefined();
    expect(savedTodo.updatedAt).toBeDefined();
  });

  // 测试缺少必填字段 title 时的验证
  it('should fail to save todo without required title', async () => {
    // 创建一个缺少 title 的 Todo
    const todoWithoutTitle = new Todo({
      completed: false
    });
    
    let err;
    try {
      await todoWithoutTitle.save();
    } catch (error) {
      err = error;
    }
    
    // 验证是否抛出正确的验证错误
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  // 测试 completed 字段的默认值
  it('should set default completed status to false', async () => {
    // 创建一个未指定 completed 状态的 Todo
    const todoWithoutCompleted = new Todo({
      title: 'Test Todo'
    });
    
    const savedTodo = await todoWithoutCompleted.save();
    expect(savedTodo.completed).toBe(false);
  });

  // 测试更新时间戳功能
  it('should update updatedAt on save', async () => {
    const todo = new Todo({
      title: 'Test Todo'
    });
    
    // 首次保存，记录更新时间
    const savedTodo = await todo.save();
    const firstUpdatedAt = savedTodo.updatedAt;
    
    // 等待一小段时间后更新
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 更新 Todo 并验证更新时间是否变化
    savedTodo.completed = true;
    const updatedTodo = await savedTodo.save();
    
    expect(updatedTodo.updatedAt.getTime()).toBeGreaterThan(firstUpdatedAt.getTime());
  });
}); 