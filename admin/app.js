const express = require('express');
const path = require('path');

//env 引用
const pay_env = require('../firebase/functions/pay.env');
const env = {
  ...pay_env(process.env.NODE_ENV,1)
}

//全域變數
global.env = process.env.NODE_ENV || "dev";
global.domain = env.web_url;
global.adminlogin = env.adminlogin; //最高管理者識別用的隨機碼
global.adminEmail = env.adminEmail //最高管理者的 email
global.firebase_api_key = env.firebase_api_key;

//前端 firebase config
let firebaseConfig = require('./firebase.config.js');
global.firebaseConfig = JSON.stringify(firebaseConfig);

const app = express();

//本套件上層需要有 session、global.admin、global.db (若沒有需要在這裡引用)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//要給 ejs 用的變數
app.locals.adminlogin = global.adminlogin;
app.locals.domain = global.domain;
app.locals.path = ""; //靜態資源前置路徑
app.locals.coloradmin = "//webfile-42a3e.web.app/coloradmin/assets/";
app.locals.froalaeditor = "//webfile-42a3e.web.app/froalaeditor/";
app.locals.headerTitle = "wayne1894 購物網";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//router
var adminRouter = require('./admin.js');

//處理登入相關的路由
app.use('/*', async function(req,res,next){
  if(req.originalUrl== "/admin/"){
    if(!req.session._uid) return res.redirect("/admin/login");
    return next();
  }
  if(req.originalUrl== "/admin/login") {
    if(req.session._uid) return res.redirect("/admin/dashboard");
    return next();
  }
  if(req.originalUrl== "/admin/logout") {
     return req.session.destroy((err) => {
         res.redirect('/admin/login');
     });
  }
    
  if(!req.session._uid) return res.redirect('/admin/login');
  res.locals.session = req.session;
 
  next();
});

app.use('/', adminRouter);

module.exports = app;