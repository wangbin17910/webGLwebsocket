/****
	* @author wangbin17910@gmail.com
	*
	***/
//导入服务器需要的nodeJS模块
var server = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs"),
	zlib = require("zlib"),
	config = require("./config"),
	qs = require('querystring'),
	mime = require("./mime").types;

// 处理客户端的请求
server.createServer(function (request, response) {
	response.setHeader("Server","Node");
	//得到请求的文件路径
	var pathname = url.parse(request.url).pathname;
	//得到页面的参数
	var parameter = qs.parse(url.parse(request.url).query);
	console.log(parameter);
	//路由到欢迎页面
	if (pathname.slice(-1) === '/'){
		pathname = pathname + config.Welcome.file;
	}
	//更改为真实的文件路径，并禁止访问服务器文件
    var realPath = path.join("app", path.normalize(pathname.replace(/\.\./g, "")));
	//console.log(realPath);
	var pathHandle = function(realPath){
		//文件的相关状态信息
		fs.stat(realPath, function(err, stats){
			if(err){
			//输出404错误
				response.writeHead(404, "Not Found",{'Content-Type': 'text/plain'});
				response.write("请求的文件 " + pathname + " 不在服务器上.");
				response.end();
			}else{
				if(stats.isDirectory()){
					realPath = path.join(realPath, "/", config.Welcome.file);
					pathHandle(realPath);
				}else{
					//设定未知MIME类型
					var ext = path.extname(realPath);
					ext = ext ? ext.slice(1) : 'html';
					var contentType = mime[ext] || "text/plain";
					response.setHeader("Content-Type", contentType);
					
					//返回上次编辑的时间
					var lastModified = stats.mtime.toUTCString();
					var ifModifiedSince = "If-Modified-Since".toLowerCase();
					response.setHeader("Last-Modified", lastModified);
					
					//返回Expires请求头
					if(ext.match(config.Expires.fileMatch)){
						var expires = new Date();
						expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
						response.setHeader("Expires", expires.toUTCString());
						response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);
					}
					
					//读取文件前如果没有更改就让浏览器读取本地缓存
					//返回304状态
					if(request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]){
						response.writeHead(304, "Not Modified");
						response.end();
					}else{
					//否则读取文件并进行gzip压缩然后返回
						var raw = fs.createReadStream(realPath);
						var acceptEncoding = request.headers['accept-encoding'] || "";
						var matched = ext.match(config.Compress.match);
						
						if(matched && acceptEncoding.match(/\bgzip\b/)){
							response.writeHead(200, "Ok", {'Content-Encoding': 'gzip'});
                            raw.pipe(zlib.createGzip()).pipe(response);
						}else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
                            response.writeHead(200, "Ok", {'Content-Encoding': 'deflate'});
                            raw.pipe(zlib.createDeflate()).pipe(response);
                        } else {
                            response.writeHead(200, "Ok");
                            raw.pipe(response);
                        }
					}
				}
			}
		});
	};
	pathHandle(realPath);
}).listen(9099);

//控制台中输出信息
console.log("Server is listening port 9099...");
