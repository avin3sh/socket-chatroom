//Handles all the SOCKETIO sent/received/emit events separate from main chatController

module.exports = function(app, io, cookie, Chats){//stores app and io var received from main chatController
    
    io.on('connection', function(socket){//Everything from this point happens as long as there is a socket connection between the client and server
        console.log('a user connected');//every time a 'connection' event occurs, it basically means someone joined the server
            console.log("cookie val is: "+cookie);

        //defines what happens when a 'disconnect' event occurs aka when a user leaves the server
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
        //xxx
        
        //defines what happens when a user joins a room for the first time and chat.js client controller sends 'join room' event 
        socket.on('join room',function(data){
            console.log('room register request received');
            socket.join(data.roomname);//registers the client with the room it entered
            console.log(data.username+' registered in room '+data.roomname);
        });
        //xxx
        
        //'chat message' event is sent(and also emitted) every time some client sends a new message from the room(and the message is passed to the room it is registered with)
        socket.on('chat message', function(msg){
            console.log(msg.username + ' sent message "'+ msg.message + '" from '+msg.room);
            io.to(msg.room).emit('chat message',msg,cookie);//forwards the message received from the client to everyone in the same room as of client
            Chats({username: cookie, message: msg.message, time: Date(), room: msg.room}).save(function(err, data){
                console.log("Inserted in db "+ msg);
            });
        });
        //xxx
        
    });
}; 
