// 临时脚本：创建数据库
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function setupDatabase() {
  let connection;
  try {
    // 1. 连接到 MySQL Server (不指定数据库)
    console.log('正在连接 MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('MySQL 连接成功！');

    // 2. 创建开发数据库
    const devDbName = process.env.DB_NAME || 'sky_whispers';
    console.log(`正在创建开发数据库: ${devDbName}`);
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${devDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    // 3. 创建测试数据库
    const testDbName = `${devDbName}_test`;
    console.log(`正在创建测试数据库: ${testDbName}`);
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${testDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    console.log('\n✅ 数据库创建完成！');
    console.log(`   开发数据库: ${devDbName}`);
    console.log(`   测试数据库: ${testDbName}`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示：请确保 MySQL 服务正在运行！');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
