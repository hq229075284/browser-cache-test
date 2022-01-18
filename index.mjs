import http from 'http'
import fs from 'fs'
import dayjs from 'dayjs'

function withExpiresHeader(res){
    res.setHeader('Expires',dayjs(new Date()).add(10,'m').toString())
    res.writeHead(200,{
        // 'content-type':'text/html'
    })
}
function withExpiresContent(res,content){
    // just for javascript
    res.write(
        content.replace(/<%\s*([a-z]+)\s*%>/,`this is response for expires test\\n再次请求script.js时，在缓存过期前，不会与服务器交互`)
    )
}

const server=http.createServer((req,res)=>{
    const {searchParams}=new URL(req.url,`http://${req.headers.host}`)
    const cacheType=searchParams.get('cache')
    if(!cacheType){
        res.end()
        return
    }
    console.log(`response for ${cacheType}, url: ${req.url}`)
    
    let content
    if(req.url.includes('js')){
        content=fs.readFileSync('./script.ejs').toString()
    }else{
        content=fs.readFileSync('./index.ejs').toString()
        content=content.replace(/<%\s*([a-z]+)\s*%>/,`this is response for <u>${cacheType}</u> test`)
        content=content.replace(/script\.js/,`script.js?cache=${cacheType}`)
    }
    
    
    
    switch(cacheType){
        case 'expires':
            withExpiresHeader(res)
            // 必须在header设置之后执行write
            withExpiresContent(res,content)
            break
        case 'cache-control':
            break
        default:
    }
    

    res.end()
})

server.listen(9090,()=>console.log(9090))