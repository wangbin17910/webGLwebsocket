/**
 * @author wangbin17910@gmail.com
 * 服务器配置文件
 */

 //缓存
exports.Expires = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60 * 60 * 24 * 365
};
//需要gzip压缩的文件
exports.Compress = {
    match: /css|js|html/ig
};
//配置初始化页面
exports.Welcome = {
    file: "index.html"
};