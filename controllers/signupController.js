module.exports = function(req, res, Users){
    console.log("Signup request received");
    var username = req.body.username;
    var pass = req.body.password;

    Users({username: username, password: pass}).save(function(err, data){
        if(data){
            console.log("Success");
            res.send(`Success! <a href="/">Click here</a> to login with your credentials`);
        }else{
            res.send(`Oops! It seems like you left a field empty or the username already exists, care to <a href="/">try again</a>?`);
        }
    });
    
};
