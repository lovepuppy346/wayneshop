const auth = function(req,res,next){
    // console.log(res.locals.session,"res.locals.session")
    if(!res.locals.session.uid) return res.redirect("/");
    next();
}

module.exports = auth;
