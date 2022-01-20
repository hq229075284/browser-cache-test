import http from "http";
import fs from "fs";
import dayjs from "dayjs";

const CACHE_KEY_NAME = "cache";
const EXPIRES = "expires";
const CACHE_CONTROL = "cache-control";
const IF_MODIFIED_SINCE_AND_LAST_MODIFIED = "If-Modified-Since,Last-Modified";
const IF_NONE_MATCH_AND_ETAG = "If-None-Match,Etag";
function isJS({ url }) {
  return /\.js[$\?#]/.test(url);
}

function setHeader(req, res) {
  switch (getCacheType(req)) {
    case EXPIRES:
      res.setHeader(EXPIRES, dayjs(new Date()).add(10, "m").toString());
      break;
    case CACHE_CONTROL:
      res.setHeader(CACHE_CONTROL, "max-age=" + 10); // 单位是秒
      break;
    case IF_MODIFIED_SINCE_AND_LAST_MODIFIED:
      if (isJS(req)) {// 对js文件进行协商缓存
        // 取缓存时，仅需返回304状态码，不需要传递Last-Modified头部
        // If-Modified-Since的值取决于200状态码时，Last-Modified字段设置的值
        if (req.headers["if-modified-since"]) {
          res.writeHead(304);
        } else {
          res.writeHead(200, { "Last-Modified": dayjs().toString() });
        }
      }
    case IF_NONE_MATCH_AND_ETAG:
      if (isJS(req)) {// 对js文件进行协商缓存
        if (req.headers["if-none-match"]) {
          res.writeHead(304);
        } else {
          res.writeHead(200, { "Etag": '123' });
        }
      }
    default:
  }
}

function setBody(req, res) {
  let content;
  const cacheType = getCacheType(req);
  const regexp = /<%\s*([a-z]+)\s*%>/;
  if (isJS(req)) {
    content = fs.readFileSync("./script.ejs").toString();
    const prefix = `this is response for ${cacheType} test`;
    const connector = "\\n";
    switch (cacheType) {
      case EXPIRES:
        res.write(
          content.replace(
            regexp,
            `${prefix}${connector}再次请求script.js时，在缓存过期前，不会与服务器交互`
          )
        );
        break;
      case CACHE_CONTROL:
        res.write(
          content.replace(
            regexp,
            `${prefix}

再次请求script.js时，在max-age时间内，不会与服务器交互

当正常重载时，request headers会带上Cache-Control:max-age=0
参考:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#max-age_2

当硬性重载时，request headers会带上Cache-Control:no-cache,会忽略cache，直接与服务器交互
参考:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-cache_2`
          )
        );
        break;
      case IF_MODIFIED_SINCE_AND_LAST_MODIFIED:
        res.write(
          content.replace(
            regexp,
            `${prefix}${connector}第二次请求script.js时，如果在上一次请求资源之后未修改，则此时间戳应和第一次一样，timestamp:${dayjs().toString()}`
          )
        );
        break;
      case IF_NONE_MATCH_AND_ETAG:
        res.write(
          content.replace(
            regexp,
            `${prefix}${connector}第二次请求script.js时，如果匹配上Etag，则此时间戳应和第一次一样，timestamp:${dayjs().toString()}`
          )
        );
        break;
      default:
        res.write(content);
    }
  } else {
    content = fs.readFileSync("./index.ejs").toString();
    content = content.replace(
      /<%\s*([a-z]+)\s*%>/,
      `this is response for <u>${cacheType}</u> test`
    );
    content = content.replace(/script\.js/, `script.js?cache=${cacheType}`);
    res.write(content);
  }
}

function getCacheType(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const cacheType = searchParams.get(CACHE_KEY_NAME);
  return cacheType;
}

// http://localhost:9090/?cache=expires
// http://localhost:9090/?cache=cache-control
const server = http.createServer((req, res) => {
  if (!getCacheType(req)) {
    console.log('x request '+req.url)
    res.end();
    return;
  }
  console.log(`response for ${getCacheType(req)}, url: ${req.url}`);

  setHeader(req, res);

  setBody(req, res);

  res.end();
});

server.listen(9090, () => console.log(9090));
