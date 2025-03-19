const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  console.log(`${request.method} ${url.pathname}`);

  // 创建转发到目标服务器的URL
  // 根据路径确定目标服务器
  let baseUrl = '';
  let pathname = url.pathname;

  // 处理 /todo-api 代理
  if (url.pathname.startsWith('/todo-api/')) {
    baseUrl = 'https://todo.holdrop.com';
    // 移除 /todo-api 前缀
    pathname = url.pathname.replace('/todo-api', '');
  } else if (url.pathname.startsWith('/user-api/')) {
    baseUrl = 'https://user.holdrop.com';
    // 移除 /user-api 前缀
    pathname = url.pathname.replace('/user-api', '');
  } else {
    // 返回404
    return new Response('no api', { status: 404 });
  }

  // 更新 url.pathname 为处理后的路径
  url.pathname = pathname;
  const targetUrl = new URL(url.pathname + url.search, baseUrl);
  // 复制原始请求的headers和body
  // 创建新的Headers对象，以便添加自定义header
  const newHeaders = new Headers(request.headers);
  // 添加自定义header
  newHeaders.set('X-Proxy-Custom-token', 'im-eeispgod');

  const requestInit: RequestInit = {
    method: request.method,
    headers: newHeaders,
  };
  // 如果请求有body，则添加到转发请求中
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    requestInit.body = await request.clone().arrayBuffer();
  }

  try {
    // 转发请求到目标服务器
    const response = await fetch(targetUrl.toString(), requestInit);
    // 创建新的Response对象，包含从目标服务器获取的内容
    const responseBody = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`Proxy error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const certFile = '/root/.acme.sh/runnngapi.top_ecc/fullchain.cer'; // 使用 fullchain.cer，包含证书链
const keyFile = '/root/.acme.sh/runnngapi.top_ecc/runnngapi.top.key';

try {
  Deno.serve({
    port: 443,
    cert: Deno.readTextFileSync(certFile),
    key: Deno.readTextFileSync(keyFile),
    handler,
  });

  console.log(`HTTPS server listening on https://localhost`); // 注意这里是 https
} catch (error) {
  console.log(error);
}

// HTTP 服务器 - 重定向到 HTTPS
Deno.serve({ port: 80 }, (req) => {
  const url = new URL(req.url);
  url.protocol = 'https:';
  url.port = '443';
  return new Response(null, {
    status: 301,
    headers: { Location: url.toString() },
  });
});
