$(function(){
    var socket = io();
    var getroomcount = function(){
        //alert("It works bruh");
        socket.emit('get-room-count');
    }
    getroomcount();

    socket.on('set-room-count', function(data){
        $('#'+data.roomname+" > li").append(`<span class="badge">`+data.count+"</span>");
    });
});
