const express = require('express');
const app = express();
const bodyParser=require("body-parser");

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let ejs = require('ejs');
var path = require("path");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

var room;
var chatstudent;

app.get("/chat/:cid/:sid",function(req,res){
	 room=req.params.cid;
	 chatstudent=req.params.sid;
	res.render("chat",{"room":room,"chatstudent":chatstudent})
})
io.on('connection', (socket) => {
  //welcome current user
  socket.emit('message',room);
  console.log("screw")
  //broadcast when a user connects
  socket.broadcast.emit('message','a user has joined ')

  //when client disconnects
  socket.on('disconnect',()=>{
      io.emit('message','a user left the chat')
  });

 //listen for chatMessage
 socket.on('chatMessage',(msg)=>{
     console.log(msg)
 })

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});