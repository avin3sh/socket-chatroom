module.exports = function(req, res, Users, app){
    
    var username = req.body.username;
    var pass = req.body.password;

    Users.count({username: username, password: pass}, function(err, data){
        if(data===1){
            console.log("Login success");
            res.cookie('username' , username).send('Cookie is set');
        }else{
            console.log("Login FAILED");        
        }
    });
    
};
