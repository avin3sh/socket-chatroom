
module.exports = function (req, res, Users, Chatroom, cookie) {

    var username = req.body.username;
    var pass = req.body.password;
    console.log("Received username and passs is: "+ username + " , "+ pass);

    Users.count({ username: username, password: pass }, function (err, data) {
        if (data === 1) {
            console.log("Login success for " + username);
            res.cookie('username', username, { maxAge: 9999 }); 
            cookie = req.cookies.username;

            var loginusername = { uname: username };
            /*Chatroom.find({}, function (err, data) {
                if (err) throw err;
                //console.log(data);
                var crlistejsmetadata = { title: 'TheChat Project' }; //to pass some generic vars to ejs template of chatroom-list
                res.render('chatroom-list', { meta: crlistejsmetadata, Username: loginusername, chatroomdata: data }); //passing post variable from login page, namely username to the main chatroom page along with db result

            });*/
            res.redirect('/');
        } else {
            res.send(`Invalid details! <a href="/">Click here</a> to try again.`);
        }
    });

};
