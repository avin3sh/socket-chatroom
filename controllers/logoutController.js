module.exports = function (req, res) {
    console.log("Cookies not cleared: " + req.cookies.username);

    res.clearCookie('username');
    console.log("Cookies cleared: " + req.cookies.username);
    res.redirect('/');
};