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

    //populates room
    socket.on('populate-room', function (data) {
        console.log("received data " + data.roomname);
        $('#room-title').append("Welcome to " + data.roomname);
        var cookieusername = data.cookieusername;
        $('#sendUsername').attr('value', cookieusername);
        for (var i = data.chats.length - 1; i >= 0; i--) {
            $('#chat-box').append(`
            <li class="list-group-item">
                <span class="badge">`+ data.chats[i].username + `</span>` +
                data.chats[i].message + `
                            </li>
                            `);
        }
        autoscroll();
    });
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

    //handles error messsages
    socket.on('error-popup', function (data) {
        alert(data.msg);
    });
    //

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
    //cross browser support

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }


    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    // Put variables in global scope to make them available to the browser console.
    var constraints = { audio: true };
    $('#audio-chat-on').on('click', function () {
        if ($('#audio-chat-on').is(':checked')) {
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

                    if ($('#audio-chat-on').is(':checked')) {
                        socket.emit('radio', blob, { roomname: $('#sendChatroomName').val() });
                        mediaRecorder.start();
                        //console.log("Emitting to server");
                    } else {
                        //mediaRecorder.stop();
                        socket.emit('radio', blob, { roomname: $('#sendChatroomName').val() });//send the last chunk
                    }
                };

                // Start recording
                mediaRecorder.start();

                // Stop recording after 5 seconds and broadcast it to server
                var infiniterecord = setInterval(function () {
                    mediaRecorder.stop();
                    if (!$('#audio-chat-on').is(':checked'))
                        clearInterval(infiniterecord);
                    //console.log("Recording");
                }, 250);
            });
        }
    });

    socket.on('voice', function (arrayBuffer) {
        //console.log("received at client, playing");
        var blob = new Blob([arrayBuffer], { 'type': 'audio/ogg; codecs=opus' });
        var audio = document.createElement('audio');
        audio.src = window.URL.createObjectURL(blob);
        audio.play();
    });
}); 
