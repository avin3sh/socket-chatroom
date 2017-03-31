$(function () {
    var autoscroll = function () {
        $("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
    };
    var audio = document.querySelector('audio');

    var socket = io();
    //register with room when entered for the first time
    if ($('#sendChatroomName').val() !== undefined) {
        socket.emit('join room', { roomname: $('#sendChatroomName').val(), username: $('#sendUsername').val() });
        autoscroll();//autoscrolls to bottom on first laod
    }
    //xxx

    //Defines the function which will be executed every time a message has to be sent to the server
    var emitFunction = function () {
        if ($.trim($('#sendMsgfield').val()) !== "" || $.trim($('#sendMsgfield').val()) !== "") {
            socket.emit('chat message', { username: $('#sendUsername').val(), message: $('#sendMsgfield').val(), room: $('#sendChatroomName').val() });
            var d = $('#chat-box');
            var actualh = d.prop("scrollHeight");
            console.log(actualh);
            d.scrollTop(actualh);//scroll to bottom upon sending message
        }
        $('#sendMsgfield').val('');
        return false;
    };
    //xxx

    //Handles event which triggers sending of the message to the server, either once enter key is pressed or sent button is clicked
    $('#sendMsgButton').on('click', function () { emitFunction(); });
    $('#sendMsgfield').keypress(function (e) {
        if (e.which == 13) {
            emitFunction();
        }
    });
    //xxx

    //Defines what to do when 'chat message' event is received - add new message(s) in the chat box
    socket.on('chat message', function (msg, susername) {
        $('#chat-box').append(`
         <li class="list-group-item">
            <span class="badge">`+ susername + `</span>` +
            msg.message + `
          </li>`);

        autoscroll();//scrolls to bottom on new message arrival
    });
    //xxx

    //defines what to do when a user joins a room
    socket.on('user-joined', function (data) {
        $('.chatroom-sidebar').append(`<li class="list-group-item sidebar-username" id='sidebar-` + data.username + `'>` + data.username + `</li>`);
    });
    //xxx

    //whe user (re)enters the room for the first time/again, an array of data with list of users already in the room is supplied
    socket.on('sidebar-data-firstload', function (data) {
        console.log(data.length);
        if (data.length !== 0) {
            for (var i = 0; i < data.length; i++) {
                $('.chatroom-sidebar').append(`<li class="list-group-item sidebar-username" id='sidebar-` + data[i].username + `'>` + data[i].username + `</li>`);
            }
        }
    });
    //xxx

    //if a user disconnects, remove him from sidebar
    socket.on('remove-sidebar-user', function (data) {
        $('#sidebar-' + data.username).remove();
    });
    //


    //webrtc stufcc

    // Put variables in global scope to make them available to the browser console.
    var constraints = { audio: true };

    $('#toggle-rtc').on('click', function () {
        navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
            var mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorder.onstart = function (e) {
                this.chunks = [];
            };
            mediaRecorder.ondataavailable = function (e) {
                this.chunks.push(e.data);
            };
            mediaRecorder.onstop = function (e) {
                var blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
                socket.emit('radio', blob, { roomname: $('#sendChatroomName').val() });
                console.log("Emitting to server");
                mediaRecorder.start();

            };

            // Start recording
            mediaRecorder.start();

            // Stop recording after 5 seconds and broadcast it to server
            setInterval(function () {
                mediaRecorder.stop()
            }, 1000);
        });
    });

    socket.on('voice', function (arrayBuffer) {
        console.log("received at client, playing");
        var blob = new Blob([arrayBuffer], { 'type': 'audio/ogg; codecs=opus' });
        var audio = document.createElement('audio');
        audio.src = window.URL.createObjectURL(blob);
        audio.play();
    });
}); 
