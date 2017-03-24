//Handles all the SOCKETIO sent/received/emit events separate from main chatController

module.exports = function (io, Chats, Cookie) {//stores  io var and Chats db received from main chatController, loginusername is receives from established cookie

    io.on('connection', function (socket) {//Everything from this point happens as long as there is a socket connection between the client and server
        console.log('a user connected');//every time a 'connection' event occurs, it basically means someone joined the server
        //console.log("The obtained username is : " + loginusername);
        //console.log("The client headers are: "+Cookie.parse(socket.handshake.headers.cookie));

        //defines what happens when a 'disconnect' event occurs aka when a user leaves the server
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
        //xxx

        //defines what happens when a user joins a room for the first time and chat.js client controller sends 'join room' event 
        socket.on('join room', function (data) {
            console.log('room register request received ' + data.roomname);
            if (data.roomname != undefined) {
                socket.join(data.roomname);
                //console.log(loginusername + ' registered in room ' + data.roomname);

            }//registers the client with the room it entered
        });
        //xxx

        //'chat message' event is sent(and also emitted) every time some client sends a new message from the room(and the message is passed to the room it is registered with)
        socket.on('chat message', function (msg) {
            console.log(msg.username + ' sent message "' + msg.message + '" from ' + msg.room);
            io.to(msg.room).emit('chat message', msg, msg.username);//forwards the message received from the client to everyone in the same room as of client, as well as username as obtained from loginController
            Chats({ username: msg.username, message: msg.message, time: Date(), room: msg.room }).save(function (err, data) {
                //console.log("Inserted in db "+ msg);
            });
        });
        //xxx

    });
}; 
