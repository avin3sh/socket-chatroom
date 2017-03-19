var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var ioController = require('../controllers/ioController');
var loginController = require('../controllers/loginController');
var signupController = require('../controllers/signupController');

var urlencodedParser = bodyParser.urlencoded({ extended: false });//just to make body parser work, so that we can handle the post requests

//connect to the mongodb database
mongoose.connect('mongodb://127.0.0.1:27017/chatdb');
//create a schema - a blue print for data
var chatroomSchema = new mongoose.Schema({
    name: String,
    owner: String
});
var chatsSchema = new mongoose.Schema({
    username: String,
    message: String,
    time: Date,
    room: String
});
var usersSchema = new mongoose.Schema({
    username: { type: String, lowercase: true, unique: true, required: true },
    password: { type: String, required: true }
});
//defining model
var Chatroom = mongoose.model('chatrooms', chatroomSchema);//'chatrooms' name of collection based on 'chatroomSchema' which will get stored in db
var Chats = mongoose.model('chats', chatsSchema);
var Users = mongoose.model('users', usersSchema);
//xxx

module.exports = function (app, io) {

    //handles main page, where user is forced to choose a username
    app.get('/', function (req, res) {
        var cookie = req.cookies.username;
        var Username = { uname: req.cookies.username };//get cookie value
        if (!cookie) {
            res.render('login');//display login page if cookie is absent i.e. user is logged out
        } else {
            Chatroom.find({}, function (err, data) {
                if (err) throw err;
                //console.log(data);
                res.render('chatroom-list', { Username: Username, chatroomdata: data }); //passing post variable from login page, namely username to the main chatroom page along with db result
                console.log(cookie);
            });
        }
    });

    /*app.post('/chatrooms', urlencodedParser, function (req, res) {
        Chatroom.find({}, function (err, data) {
            if (err) throw err;
            //console.log(data);
            res.render('chatroom-list', { postdata: req.body, chatroomdata: data }); //passing post variable from login page, namely username to the main chatroom page along with db result

        })
    });
*/
    app.post('/room', urlencodedParser, function (req, res) {
        var cookie = req.cookies.username;

        //console.log(req.body.roomname);
        if (!cookie) {
            res.send(`<a href="/">Click here</a> to login`);
        } else {
            Chats.find({ room: req.body.roomname }).sort({ time: 1 }).exec(function (err, data) {
                if (err) throw err;
                console.log(data);
                res.render('chatroom', { postdata: req.body, chatdata: data });
            });
        }
    });

    ioController(app, io);//manages all the socket.io activities

    app.post('/auth/login', urlencodedParser, function (req, res) {
        loginController(req, res, Users, app, Chatroom);

    });

    app.post('/auth/register', urlencodedParser, function (req, res) {
        signupController(req, res, Users, app, Chatroom);
    });


};
