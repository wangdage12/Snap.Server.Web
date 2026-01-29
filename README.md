# Snap.Hutao服务器管理后台

该项目用于管理Snap.Hutao项目的服务器的后台系统，提供官网页面和用户、公告管理等功能。

## 部署

确保你已经安装了Node.js和npm。

克隆仓库到本地，在项目根目录下运行以下命令安装依赖：

```bash
npm install
```

**编辑`.env.x`中的VITE_API_BASE_URL变量值为你的API地址，环境变量文件名中的`x`为开发环境（development）或者生产环境（production）**

### 启动开发服务器

运行以下命令启动开发服务器：

```bash
npm run dev
```

### 构建静态文件

运行以下命令构建生产环境的静态文件：

```bash
npm run build
```
