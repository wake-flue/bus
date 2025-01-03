# Log API 文档

## 模型定义

### Log模型

```typescript
interface Log {
  timestamp: Date;        // 日志时间戳
  level: string;         // 日志级别
  message: string;       // 日志消息
  meta: {
    operation: string;   // 操作类型
    model: string;      // 相关模型
    source: string;     // 来源(frontend/backend)
    environment: string; // 环境(development/production)
    requestInfo?: {     // HTTP请求信息
      method: string;
      url: string;
      ip: string;
      headers: any;
      query: any;
    };
    responseInfo?: {    // HTTP响应信息
      status: number;
      message: string;
      duration: number;
    };
    error?: {          // 错误信息
      name: string;
      message: string;
      stack: string;
    };
    client?: {         // 客户端信息
      browser: string;
      os: string;
      device: string;
      url: string;
    };
    additionalData?: any; // 其他元数据
  };
}
```

#### 字段说明
- level: 日志级别，可选值：error/warn/info/http/verbose/debug/silly
- source: 日志来源，可选值：frontend/backend
- environment: 运行环境，可选值：development/production

## API端点

### 获取日志列表
```http
GET /api/v1/logs
```

查询参数：
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认20，最大100
- `sortBy`: 排序字段(timestamp/level/message)，默认timestamp
- `sortOrder`: 排序方向(asc/desc)，默认desc
- `level`: 日志级别过滤
- `source`: 来源过滤(frontend/backend)
- `status`: HTTP状态码过滤
- `operation`: 操作类型过滤
- `errorType`: 错误类型过滤
- `startTime`: 开始时间
- `endTime`: 结束时间
- `search`: 搜索关键词(匹配message和operation)
- `environment`: 环境过滤(development/production)

响应示例：
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "level": "info",
        "message": "示例日志",
        "meta": {
          "operation": "GET_TODOS",
          "source": "backend",
          "environment": "development",
          "requestInfo": {
            "method": "GET",
            "url": "/api/todos"
          }
        }
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    },
    "filters": {
      "level": "info",
      "source": "backend"
    },
    "sort": {
      "sortBy": "timestamp",
      "sortOrder": "desc"
    }
  }
}
```

### 获取日志详情
```http
GET /api/v1/logs/:id
```

路径参数：
- `id`: Log ID

响应示例：
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "level": "info",
    "message": "示例日志",
    "meta": {
      "operation": "GET_TODOS",
      "source": "backend",
      "environment": "development",
      "requestInfo": {
        "method": "GET",
        "url": "/api/todos"
      },
      "responseInfo": {
        "status": 200,
        "message": "操作成功",
        "duration": 50
      }
    }
  }
}
```

错误响应：
- 400: 无效的ID格式
- 404: 资源不存在

### 创建日志
```http
POST /api/v1/logs
```

请求体：
```json
[
  {
    "level": "info",
    "message": "示例日志",
    "meta": {
      "operation": "CREATE_TODO",
      "source": "backend",
      "environment": "development"
    }
  }
]
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
``` 