# Docker Compose 配置详解

`docker-compose.yml` 文件定义了如何构建和运行这个 Nginx 反向代理服务。本文档详细解释了该文件的每个部分及其作用。

## 基本结构

```yaml
version: '3' # Docker Compose 文件格式版本

services: # 定义所有服务
  nginx-proxy:# 服务名称
  # ... 服务配置 ...

networks: # 定义网络
  proxy-network:# 网络名称
  # ... 网络配置 ...
```

## 服务配置详解

### `nginx-proxy` 服务

```yaml
nginx-proxy:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: nginx-proxy
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./certs:/root/.acme.sh/runnngapi.top_ecc:ro
  restart: unless-stopped
  networks:
    - proxy-network
```

#### `build` - 构建镜像配置

- `context: .` - 使用当前目录作为构建上下文（即 Dockerfile 所在的目录）
- `dockerfile: Dockerfile` - 使用名为 Dockerfile 的文件作为构建指令

#### `container_name: nginx-proxy`

- 指定容器的名称，而不是使用 Docker Compose 自动生成的名称
- 方便在命令行中引用这个容器（例如：`docker logs nginx-proxy`）

#### `ports` - 端口映射

- `'80:80'` - 将主机的 80 端口映射到容器的 80 端口（HTTP）
- `'443:443'` - 将主机的 443 端口映射到容器的 443 端口（HTTPS）
- 这使得外部可以通过主机的这些端口访问容器中的 Nginx 服务

#### `volumes` - 卷挂载

- `./nginx.conf:/etc/nginx/nginx.conf:ro`

  - 将主机上的 nginx.conf 文件挂载到容器内的 /etc/nginx/nginx.conf
  - `:ro` 表示只读（read-only），防止容器内部修改这个文件
  - 这样可以在不重建镜像的情况下更新 Nginx 配置

- `./certs:/root/.acme.sh/runnngapi.top_ecc:ro`
  - 将主机上的 certs 目录挂载到容器内指定路径
  - 包含 SSL 证书和私钥
  - 同样是只读模式

#### `restart: unless-stopped`

- 容器的重启策略
- `unless-stopped` 表示容器会在退出时自动重启，除非被明确停止
- 这确保服务在出错后能自动恢复，也在主机重启后自动启动

#### `networks: - proxy-network`

- 指定容器应该连接到的网络
- 将容器连接到名为 `proxy-network` 的网络

## 网络配置详解

```yaml
networks:
  proxy-network:
    driver: bridge
```

#### `proxy-network` - 自定义网络名称

- 创建一个名为 `proxy-network` 的网络

#### `driver: bridge`

- 指定网络的驱动类型为 `bridge`（桥接）
- 这是 Docker 的默认网络驱动，适用于大多数场景
- bridge 网络允许同一 Docker 主机上的容器相互通信

## 使用场景和扩展

### 添加多个服务

如果你需要在同一网络中添加更多服务，例如添加一个数据库：

```yaml
services:
  nginx-proxy:
    # ... 现有配置 ...

  database:
    image: postgres:13
    container_name: app-db
    volumes:
      - ./data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secure_password
    networks:
      - proxy-network
```

### 添加环境变量

对于需要环境变量的场景：

```yaml
services:
  nginx-proxy:
    # ... 现有配置 ...
    environment:
      - TZ=Asia/Shanghai # 设置时区
      - DEBUG=false # 自定义环境变量
```

### 使用环境变量文件

对于有大量环境变量的场景：

```yaml
services:
  nginx-proxy:
    # ... 现有配置 ...
    env_file:
      - ./config.env # 从文件加载环境变量
```

## 实用命令

### 启动服务

```bash
docker-compose up -d
```

### 查看容器日志

```bash
docker-compose logs -f nginx-proxy
```

### 停止服务

```bash
docker-compose down
```

### 重建服务（更新配置后）

```bash
docker-compose up -d --build
```

### 进入容器内部

```bash
docker-compose exec nginx-proxy sh
```
