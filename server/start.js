var io = require('socket.io').listen(8088);
// 所有在线的用户
var userList = {};
// 所有在聊天室的人
var allChatter = {};

io.sockets.on('connection', function (socket) {
	var session = socket.id;
	userList[session] = socket;
	
	// 有新成员加入的时候
	socket.broadcast.emit('newMem',session);
	
	// 退出的时候发送退出消息
	socket.on('disconnect', function () { 
		delete userList[session];
		try{
			delete allChatter[session];
		}catch(err){
		
		}
		socket.broadcast.emit('leave',session);
		session = null;
	});
	
	// 把操作发送给其他所有成员
	socket.on('keyDown',function(data){
		var msg = {
			key:data,
			id:session
		};
		socket.broadcast.emit('keyDown',msg);
	});
	
	socket.on('keyUp',function(data){
		var msg = {
			key:data,
			id:session
		};
		socket.broadcast.emit('keyUp',msg);
	});
	
	// 登录聊天室时的消息
	socket.on('enterChatroom',function(data){
		allChatter[session] = data.nickName;
		// 返回在线列表
		socket.emit('userList',allChatter);
		// 自己登录当作新添加的用户处理
		for(var i in allChatter){
			console.log(i);
			userList[i].emit('enterChatroom',{
				nickName : data.nickName,
				id : session	
			});
		}
	});
	
	// 发送消息时的处理
	// 本应循环找出所有登录的用户发送消息，但是感觉开销比较大
	socket.on('chatMsg',function(data){
		for(var i in allChatter){
			userList[i].emit('newMsg',{
				nickName : allChatter[session],
				content : data.content,
				privateMsg : false
			});
		}
	});
	
	// 私聊
	socket.on('privateChatMsg',function(data){
		socket.emit('newMsg',{
			nickName : allChatter[session],
			content : data.content,
			privateMsg : true
		});
		userList[ data.toid ].emit('newMsg',{
			nickName : allChatter[session],
			content : data.content,
			privateMsg : true
		});
	});
	
	//报告位置时发送消息
	socket.on('position',function(data){
		//socket.broadcast.emit('position',data);
		data.id=session;
		userList[data.toid].emit('add',data);
	});
});
