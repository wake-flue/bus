# Todo API 文档

## 模型定义

### Todo模型

```typescript
interface Todo {
  _id: ObjectId;          // MongoDB ID，自动生成
  title: string;          // 标题，必填，2-100字符
  completed: boolean;     // 完成状态，默认false
  createdAt: Date;       // 创建时间，自动生成
  updatedAt: Date;       // 更新时间，自动生成
}
```

#### 字段验证规则
- title
  - 必填
  - 类型：字符串
  - 长度：2-100字符
  - 会自动去除首尾空格
- completed
  - 类型：布尔值
  - 默认值：false

## API端点

### 获取待办事项列表
```http
GET /api/v1/todos
```

查询参数：
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认20，最大100
- `sortBy`: 排序字段(title/createdAt/completed)，默认createdAt
- `sortOrder`: 排序方向(asc/desc)，默认desc
- `completed`: 过滤完成状态(true/false)
- `title`: 按标题模糊搜索

响应示例：
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "title": "示例待办",
        "completed": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    },
    "filters": {
      "completed": false,
      "title": "示例"
    },
    "sort": {
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### 获取待办事项详情
```http
GET /api/v1/todos/:id
```

路径参数：
- `id`: Todo ID

响应示例：
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "示例待办",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

错误响应：
- 400: 无效的ID格式
- 404: 资源不存在

### 创建待办事项
```http
POST /api/v1/todos
```

请求体：
```json
{
  "title": "新待办事项",
  "completed": false
}
```

### 更新待办事项
```http
PUT /api/v1/todos/:id
```

请求体：
```json
{
  "title": "更新的标题",
  "completed": true
}
```

### 删除待办事项
```http
DELETE /api/v1/todos/:id
```

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
- 404: 资源不存在
- 500: 服务器内部错误 