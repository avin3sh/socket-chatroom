$(function () {
    var socket = io();
    var parserooms = function (data) {
        for (var i = 0; i < data.data.length; i++) {
            $('#rooms-list').append(`<a href="#" class="list-group-item room-name" id="` + data.data[i].roomname + `"><li id="` + data.data[i].roomname + `" class="list-group-item">` + data.data[i].roomname + `<span class="badge">` + data.data[i].count + `</span></li></a>`);
        }
    };
    var getroomcount = function () {
        //alert("It works bruh");
        socket.emit('get-room-count');
    }
    getroomcount();

    socket.on('set-room-count', function (data) {
        var Username = data.username;
        parserooms(data);
        $('.room-name').on('click', function () {
            var roomName = $(this).attr("id");
            var postData = { roomname: roomName, username: Username };
            $.ajax({
                type: 'POST',
                url: '/room',
                data: postData,
                success: function (data) {
                    //do something with the data via front-end framework
                    $('body').html(data);
                }
            });
        });
    });

});
