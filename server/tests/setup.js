const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongodb;

// 连接到内存数据库
beforeAll(async () => {
  // 确保断开任何现有连接
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongodb = await MongoMemoryServer.create();
  const uri = mongodb.getUri();
  await mongoose.connect(uri);
});

// 每次测试后清理数据库
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// 断开连接并停止内存数据库
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongodb.stop();
});

// 设置测试超时时间
jest.setTimeout(30000); 