var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3000);
var chatController = require('./controllers/chatController');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
app.use(cookieParser());



//set template engine
app.set('view engine', 'ejs');

//Facilitate serving static files
app.use(express.static('./public'));

//fire controllers
chatController(app, io, cookie);//passes everything app has to the controller

//listen to a port
console.log("The server is up and running on port 3000");


 
