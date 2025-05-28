# 面包店管理系统

一个基于 Vue.js 和 Flask 的面包店管理系统，用于管理面包信息、库存和销售。

## 功能特点

- 面包信息管理（增删改查）
- 分类管理
- 搜索和过滤功能
- 响应式设计

## 技术栈

### 前端
- Vue.js
- Axios
- Element UI

### 后端
- Flask
- SQLAlchemy
- Flask-CORS
- MySQL

## 安装和运行

### 数据库设置

1. 安装 MySQL 服务器（如果尚未安装）
2. 创建数据库：
```sql
CREATE DATABASE breadshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 创建 `.env` 文件并配置数据库连接信息：
```
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=breadshop
MYSQL_PORT=3306
```

### 后端

1. 创建并激活虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 运行 Flask 服务器：
```bash
python app.py
```

服务器将在 http://localhost:5000 运行

### 前端

1. 安装依赖：
```bash
npm install
```

2. 运行开发服务器：
```bash
npm run serve
```

应用将在 http://localhost:8080 运行

## API 端点

### 分类管理
- GET /api/categories - 获取所有分类
- POST /api/categories - 创建新分类

### 面包管理
- GET /api/breads - 获取面包列表（支持分类和搜索过滤）
- POST /api/breads - 创建新面包
- PUT /api/breads/<id> - 更新面包信息
- DELETE /api/breads/<id> - 删除面包

## 数据库

系统使用 MySQL 数据库，需要先创建数据库并配置连接信息。

### 数据库表结构

#### Category 表
- id (String, PK): 分类ID
- name (String): 分类名称

#### Bread 表
- id (Integer, PK): 面包ID
- name (String): 面包名称
- price (Float): 价格
- image (String): 图片URL
- category_id (String, FK): 分类ID
- description (Text): 描述
- ingredients (JSON): 原料
- stock (Integer): 库存
- in_stock (Boolean): 是否在售
- created_at (DateTime): 创建时间
- updated_at (DateTime): 更新时间

## 开发说明

1. 确保 MySQL 服务器正在运行
2. 确保后端服务器在运行状态
3. 前端开发服务器会自动代理 API 请求到后端
4. 修改代码后，前端会自动热重载
5. 后端代码修改后需要重启服务器
