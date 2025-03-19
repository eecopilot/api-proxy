FROM nginx:alpine

# 安装必要的工具
RUN apk add --no-cache openssl

# 创建证书目录
RUN mkdir -p /root/.acme.sh/runnngapi.top_ecc/

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 HTTP 和 HTTPS 端口
EXPOSE 80 443

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 