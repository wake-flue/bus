# API 文档

## 简介

这是一个基于Express和MongoDB的RESTful API服务。

## 文档目录

API文档按功能模块拆分为以下几个部分：

1. [Todo API](./api-todo.md)
   - Todo模型定义
   - Todo相关API端点

2. [Log API](./api-log.md)
   - Log模型定义
   - 日志相关API端点

3. [User API](./api-user.md)
   - User模型定义
   - 用户认证相关API端点
   - 用户管理相关API端点

## 通用说明

### API版本
所有API端点都以 `/api/v1` 为前缀

### 认证方式
- Bearer Token认证
- Token通过登录接口获取
- 需要在请求头中添加：`Authorization: Bearer <token>`

### 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": any
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": number,
    "operation": string,
    "message": string,
    "details": any
  }
}
```

### HTTP状态码

- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权，请先登录
- 403: 禁止访问，权限不足
- 404: 资源不存在
- 409: 资源冲突(如邮箱已存在)
- 500: 服务器内部错误

### 错误处理
所有错误响应都会包含以下信息：
- code: HTTP状态码
- operation: 错误操作类型
- message: 错误信息
- details: 详细错误信息(可选)

### 分页
支持分页的接口都使用以下参数：
- page: 页码，从1开始
- pageSize/limit: 每页数量，默认值因接口而异 