//Handles all the SOCKETIO sent/received/emit events separate from main chatController

module.exports = function (io, Chats, Cookie, Userscount, Chatroom) {//stores  io var and collection dbs received from main chatController

    io.on('connection', function (socket) {//Everything from this point happens as long as there is a socket connection between the client and server
        var cookies;//this will store cookie info retrieved from socket handshake method
        console.log('a user connected');//every time a 'connection' event occurs, it basically means someone joined the server

        //defines what happens when a 'disconnect' event occurs aka when a user leaves the server
        socket.on('disconnect', function () {
            console.log('user disconnected');
            if (cookies !== undefined) {
                Userscount.find({ username: cookies.username }).remove(function (err) {//removes the username from Usercount db collection once socket is disconnected 
                    console.log("User removed from the db");
                });//deletes record from active users collection 'userscount'
                io.emit('remove-sidebar-user', { username: cookies.username });//ask all the clients in all the rooms to remove the disconnected user from the sidebar
            }
        });
        //xxx

        //defines what happens when a user joins a room for the first time and chat.js client controller sends 'join room' event 
        socket.on('join room', function (data) {
            console.log('room register request received ' + data.roomname);
            if (data.roomname !== undefined) {//since we don't call "join room" function explicitly, it would be called even when it not actually a valid request, and in that case undefined would be returned (even when user is not logged in and is on login page. Because we are including socket.js even on login page)
                cookies = Cookie.parse(socket.handshake.headers.cookie);//Parses socket handshake cookie info
                Userscount.count({ username: cookies.username, room: data.roomname }, function (err, dbdata) {//checks if user is already in the same room
                    if (dbdata === 1) {//if user is already in the same room
                        socket.emit("error-popup", { msg: "You are already in this room" });//we don't want multiple entry points to the same room as it would show the user in the sidebar multiple times(also multiple emits)
                    } else {
                        Chats.find({ room: data.roomname }).sort({ time: -1 }).limit(7).exec(function (err, chatsdbdata){//shows last 7 records
                            socket.emit('populate-room', { roomname: data.roomname, chats: chatsdbdata, cookieusername: cookies.username });//populate room emit will provide the emty chatroom template the data of all the chats as well as the username of the current logged in username(which goes into a hidden input field)
                        });
                        socket.join(data.roomname);//registers the user in the room it asked for
                        Userscount({ username: cookies.username, room: data.roomname, time: Date() }).save(function (err, data) {
                            if (err) console.log(err);
                            console.log(cookies.username + " added in the db");
                        });//Insert a record in userscount collection when a user enter a room(to show number of active users in a room)
                        //since user is entering first time, he also needs list of people already in the room
                        Userscount.find({ room: data.roomname }).sort({ time: 1 }).exec(function (err, data) {
                            socket.emit('sidebar-data-firstload', data);
                        });
                        io.to(data.roomname).emit('user-joined', { username: cookies.username });//sends name of the user to all the clients of the room when the user joins
                    }
                });
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

        //function to provide number of users in a chatroom on chatroomlist page
        socket.on('get-room-count', function () {//get-room-count is sent by client when its on main chatroom-list.ejs page
            cookies = Cookie.parse(socket.handshake.headers.cookie);//parsing cookies
            Chatroom.find({}, function (err, data) {//we search for db for ALL the rooms
                var roomcount;
                var roomobj;
                var roomsarray = [];
                for (var i = 0; i < data.length; i++) {//then for each room we run a for loop 
                    roomcount = io.sockets.adapter.rooms[data[i].name];//this method gives us number of clients in a room
                    if (roomcount === undefined) {//if room has no client, undefined would be returned, in that case 
                        roomcount = [];//we would want to send a zero 
                    }
                    roomobj = { roomname: data[i].name, count: roomcount.length };//then we create an object with roomname and count of users inside that room, for the given room
                    roomsarray.push(roomobj);//and push that object to the array of rooms
                }
                socket.emit('set-room-count', { data: roomsarray, username: cookies.username });//we send the client a data var containing array of room info and a username var containing parsed username from socket handshake
            });
        });
        //xxx


        //implementing webrtc
        socket.on('radio', function (blob, data) {//just broadcasts the incoming audio blob to all the users in the originating room with a delay
            console.log("received at server, emitting to client");
            socket.broadcast.to(data.roomname).emit('voice', blob);
        });
    });
}; 
