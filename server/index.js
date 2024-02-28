const express = require('express');
const fs = require('fs');
const cors = require('cors');
const OSS = require('ali-oss');

const app = express();
const PORT = 3000;

const store = new OSS({
  region: 'oss-cn-qingdao',
  accessKeyId: '',
  accessKeySecret: '',
  bucket: 'oss-upload-demo'
});

// 解析 JSON 请求体
app.use(express.json({ limit: '100mb' }));
app.use(cors());

// POST 请求处理程序，接收 Base64 数据
app.post('/upload', async (req, res) => {
  const base64Data = req.body.data;
  if (!base64Data) {
    return res.status(400).send('Base64 data is required');
  }

  // 解码 Base64 数据
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');

  // 将数据保存到oss
  const uploadRes = await store.put(Date.now().toString()+'.jpg', buffer)
  res.status(200).send(uploadRes);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
