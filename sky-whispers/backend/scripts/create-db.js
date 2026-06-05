// 临时脚本：创建数据库
const mysql = require('mysql2/promise');

async function createDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'sxl712712',
    });

    await connection.query(
      'CREATE DATABASE IF NOT EXISTS sky_whispers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    console.log('✅ 数据库 sky_whispers 创建成功');
  } catch (error) {
    console.error('❌ 创建数据库失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

createDatabase();
