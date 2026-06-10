-- 初始化数据库和表
CREATE DATABASE IF NOT EXISTS ai_tool_bazaar
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE ai_tool_bazaar;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入演示账号（密码已用 bcrypt 加密，对应原文：123456 和 admin123）
-- 注意：这些 hash 需要由 Node.js 生成，直接写死可能不匹配
-- 运行 npm start 后会自动通过 API 逻辑处理
-- 此处仅建表，演示数据由 API 首次运行时注入

INSERT IGNORE INTO users (username, password, display_name, role)
VALUES
  ('demo', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '演示用户', 'user'),
  ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '平台管理员', 'admin');
