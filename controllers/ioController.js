//Handles all the SOCKETIO sent/received/emit events separate from main chatController

module.exports = function (io, Chats, Cookie, Userscount) {//stores  io var and Chats db received from main chatController, loginusername is receives from established cookie

    io.on('connection', function (socket) {//Everything from this point happens as long as there is a socket connection between the client and server
        var cookies;
        console.log('a user connected');//every time a 'connection' event occurs, it basically means someone joined the server
        //console.log("The obtained username is : " + loginusername);
        //console.log("The client headers are: "+Cookie.parse(socket.handshake.headers.cookie));

        //defines what happens when a 'disconnect' event occurs aka when a user leaves the server
        socket.on('disconnect', function () {
            console.log('user disconnected');
            if (cookies !== undefined) {
                Userscount.find({ username: cookies.username }).remove(function (err) {
                    console.log("User removed from the db");
                });//deletes record from active users collection 'userscount'
            }
        });
        //xxx

        //defines what happens when a user joins a room for the first time and chat.js client controller sends 'join room' event 
        socket.on('join room', function (data) {
            if (data.roomname !== undefined) {
                cookies = Cookie.parse(socket.handshake.headers.cookie);
            }
            console.log('room register request received ' + data.roomname);
            if (data.roomname !== undefined) {
                socket.join(data.roomname);
                Userscount({ username: cookies.username, room: data.roomname }).save(function (err, data) {
                    if (err) console.log(err);
                    console.log(cookies.username + " added in the db");
                });//Insert a record in userscount collection when a user enter a room(to show number of active users in a room)
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
