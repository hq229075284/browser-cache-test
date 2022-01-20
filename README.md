# 浏览器缓存

## 强缓存

1. 资源缓存后，在过期之前，不会访问服务器

### [Expires](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires)

测试地址：http://localhost:9090/?cache=expires

### [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

测试地址：http://localhost:9090/?cache=cache-control

## 协商缓存

1. 协商缓存的资源都会与服务器交互，确认是否使用缓存

### If-Modified-Since and Last-Modified

测试地址：http://localhost:9090/?cache=If-Modified-Since,Last-Modified

### [If-None-Match](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/If-None-Match) and [Etag](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/ETag)


 [What does the HTTP header If-None-Match: * mean?](https://stackoverflow.com/questions/2111854/what-does-the-http-header-if-none-match-mean)

测试地址：http://localhost:9090/?cache=If-None-Match,Etag

