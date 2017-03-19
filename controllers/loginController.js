module.exports = function (req, res, Users, app, Chatroom) {

    var username = req.body.username;
    var pass = req.body.password;

    Users.count({ username: username, password: pass }, function (err, data) {
        if (data === 1) {
            console.log("Login success");
            res.cookie('username', username);
            var loginusername = {uname: username};
            Chatroom.find({}, function (err, data) {
                if (err) throw err;
                //console.log(data);
                res.render('chatroom-list', { Username: loginusername, chatroomdata: data }); //passing post variable from login page, namely username to the main chatroom page along with db result

            });
        } else {
            res.send(`Invalid details! <a href="/">Click here</a> to try again.`);
        }
    });

};
