# User API 文档

## 模型定义

### User模型

```typescript
interface User {
  _id: ObjectId;         // MongoDB ID，自动生成
  email: string;         // 邮箱(唯一)
  name: string;          // 用户名，2-30字符
  role: string;          // 角色，可选值：user/admin，默认user
  isActive: boolean;     // 账户状态，默认true
  lastLogin: Date;       // 最后登录时间
  createdAt: Date;       // 创建时间，自动生成
  updatedAt: Date;       // 更新时间，自动生成
}
```

#### 字段验证规则
- email
  - 必填
  - 类型：字符串
  - 格式：有效的邮箱格式
  - 唯一性：不可重复
- name
  - 必填
  - 类型：字符串
  - 长度：2-30字符
- password
  - 必填(创建时)
  - 类型：字符串
  - 长度：最少6位
  - 格式：必须包含数字和字母
- role
  - 可选
  - 类型：字符串
  - 可选值：user/admin
  - 默认值：user

## API端点

### 用户注册
```http
POST /api/v1/users/register
```

请求体：
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "示例用户"
}
```

响应示例：
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "示例用户",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 用户登录
```http
POST /api/v1/users/login
```

请求体：
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

响应示例：
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "示例用户",
      "role": "user",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 刷新访问令牌
```http
POST /api/v1/users/refresh-token
```

响应示例：
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 退出登录
```http
POST /api/v1/users/logout
```

响应示例：
```json
{
  "success": true,
  "message": "退出登录成功"
}
```

### 获取个人信息
```http
GET /api/v1/users/profile
```

需要认证：是(Bearer Token)

响应示例：
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "示例用户",
      "role": "user",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 更新个人信息
```http
PATCH /api/v1/users/profile
```

需要认证：是(Bearer Token)

请求体：
```json
{
  "name": "新用户名",
  "email": "newemail@example.com"
}
```

### 修改密码
```http
POST /api/v1/users/change-password
```

需要认证：是(Bearer Token)

请求体：
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### 获取用户列表(管理员)
```http
GET /api/v1/users
```

需要认证：是(Bearer Token + Admin Role)

查询参数：
- `page`: 页码，默认1
- `limit`: 每页数量，默认10，最大100
- `sort`: 排序字段
- `order`: 排序方向(asc/desc)
- `email`: 按邮箱过滤
- `name`: 按用户名过滤
- `role`: 按角色过滤(user/admin)
- `isActive`: 按状态过滤

响应示例：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "...",
        "email": "user@example.com",
        "name": "示例用户",
        "role": "user",
        "isActive": true,
        "lastLogin": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

### 获取指定用户信息(管理员)
```http
GET /api/v1/users/:id
```

需要认证：是(Bearer Token + Admin Role)

路径参数：
- `id`: 用户ID

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": any
}
```

### 错误响应
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

## HTTP状态码

- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权，请先登录
- 403: 禁止访问，权限不足
- 404: 资源不存在
- 409: 资源冲突(如邮箱已存在)
- 500: 服务器内部错误
``` 