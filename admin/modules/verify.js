exports.verify = verify => {
    return function(req, res, next) {
        let _root = res.locals.session._root || "";
        if(_root == "最高管理者") return next()
        if(_root.indexOf(verify)>-1) return next()
        res.redirect('/admin/dashboard');
    }
}
