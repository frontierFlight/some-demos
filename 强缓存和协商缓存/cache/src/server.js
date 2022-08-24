// 强制缓存和协商缓存;

const http = require('http');
const url = require('url');
const path = require('path');
const {stat, readFile} = require('fs/promises');
const crypto = require('crypto');

http.createServer( async (req, res) => {
   let {pathname} = url.parse(req.url);
  let fileName =  pathname === '/' 
  ? path.join(__dirname, '../', pathname, 'static/index.html')
  : path.join(__dirname, '../', pathname);
    console.log('fileName: ', fileName);

    res.setHeader('Expires', new Date(new Date().getTime() + 1000 * 20).toGMTString())
    res.setHeader('Cache-Control', 'max-age=20');
    try{
      const statObj = await stat(fileName);
      const ctime = statObj.ctime.toGMTString();
      res.setHeader('Last-Modified', ctime);

      if(req.headers['if-modified-since'] === ctime){
        return (res.statusCode = 304) && res.end();
      }

      if(statObj.isFile()){
        let result = await readFile(fileName);
        let hash = crypto.createHash('md5').update(result).digest('base64');

        res.setHeader('Etag', hash);
        if(req.headers['if-none-match'] === hash){
          return (res.statusCode = 304) && res.end();
        }
        console.log(fileName);
        res.end(result);
      }else{
        res.statusCode = 404;
        res.end('NOT FOUND');
      }
    }catch(err){
      res.statusCode = 404;
      res.end('NOT FOUND');
    }
}).listen(3000);


 