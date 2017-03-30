$(function () {
    var autoscroll = function () {
        $("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
    };

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
}); 
