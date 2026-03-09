# Snap.Hutao服务器管理后台

该项目用于管理Snap.Hutao项目的服务器的后台系统，提供官网页面和用户、公告管理等功能。

<img width="1843" height="818" alt="image" src="https://github.com/user-attachments/assets/1c5f21fb-23cf-4c32-9936-db13dfc3d3d4" />
<img width="1837" height="521" alt="image" src="https://github.com/user-attachments/assets/bd7e373c-60a1-44c6-b16b-54f3fb352e4e" />
<img width="1625" height="566" alt="image" src="https://github.com/user-attachments/assets/87ec56e3-68d9-4996-8fa8-ce08f8c1c896" />
<img width="1632" height="414" alt="image" src="https://github.com/user-attachments/assets/85fa4946-c50c-4f6f-8c37-0170b8f7246a" />
<img width="1629" height="749" alt="image" src="https://github.com/user-attachments/assets/4cb02464-b2a9-41c2-bc14-9dba10c26132" />


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
