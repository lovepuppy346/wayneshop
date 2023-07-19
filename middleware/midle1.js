 const hello = function(req, res, next) {
    console.log("hello!!!")
    next();
 }
 console.log("我是中間程式")

 module.exports = hello;