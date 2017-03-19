module.exports = function(req, res, Users, app){
    console.log("Signup request received");
    var username = req.body.username;
    var pass = req.body.password;

    Users({username: username, password: pass}).save(function(err, data){
        //if (err) throw err;
    });
    
};
