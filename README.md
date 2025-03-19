# Nginx 反向代理 Docker 部署

这个项目提供了一个基于 Docker 的 Nginx 反向代理服务，用于将请求转发到不同的目标服务器。

## 功能

- 将 HTTP 请求自动重定向到 HTTPS
- 将 `/todo-api/*` 路径下的请求代理到 `https://todo.holdrop.com`
- 将 `/user-api/*` 路径下的请求代理到 `https://user.holdrop.com`
- 为每个请求添加自定义 Header `X-Proxy-Custom-token`
- 其他路径返回 404 错误

## 目录结构

```
.
├── Dockerfile          # Docker 镜像构建文件
├── docker-compose.yml  # Docker Compose 配置文件
├── nginx.conf          # Nginx 配置文件
└── certs/              # SSL 证书目录 (需要自行创建并添加证书)
    ├── fullchain.cer   # 证书链文件
    └── runnngapi.top.key # 私钥文件
```

## 部署准备

1. 确保你的服务器已安装 Docker 和 Docker Compose

2. 克隆此仓库到你的服务器

3. 创建证书目录并添加你的 SSL 证书：

```bash
mkdir -p certs
# 将你的证书文件复制到 certs 目录
cp /path/to/your/fullchain.cer certs/
cp /path/to/your/runnngapi.top.key certs/
```

## 部署步骤

1. 构建并启动容器：

```bash
docker-compose up -d
```

2. 检查容器是否正常运行：

```bash
docker-compose ps
```

3. 查看日志：

```bash
docker-compose logs -f
```

## 维护

### 更新 Nginx 配置

1. 修改 `nginx.conf` 文件
2. 重新加载 Nginx 配置：

```bash
docker-compose exec nginx-proxy nginx -s reload
```

### 更新 SSL 证书

1. 更新 `certs` 目录中的证书文件
2. 重新加载 Nginx：

```bash
docker-compose exec nginx-proxy nginx -s reload
```

### 完全重启服务

```bash
docker-compose down
docker-compose up -d
```

## 常见问题排查

### 查看 Nginx 错误日志

```bash
docker-compose exec nginx-proxy cat /var/log/nginx/error.log
```

### 测试 Nginx 配置是否有语法错误

```bash
docker-compose exec nginx-proxy nginx -t
```

### 检查证书是否正确加载

```bash
docker-compose exec nginx-proxy nginx -T | grep ssl
```

## 安全注意事项

- 确保你的 SSL 证书权限设置正确
- 定期更新 Docker 镜像以获取安全补丁
- 考虑添加 IP 限制或基本认证以增强安全性

## 性能优化

如果需要处理高流量，考虑调整以下 Nginx 参数：

- 增加 `worker_processes` 数量
- 增加 `worker_connections` 数量
- 启用 HTTP/2
- 配置适当的缓存设置
