var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const favicon = require('serve-favicon');
var minifyHTML = require('express-minify-html');
var session = require('express-session');

var indexRouter = require('./routes/index');
var orderRouter = require('./routes/order');
var memberRouter = require('./routes/member');

var auth = require('./middleware/auth');
// var middle1 = require('./middleware/midle1');
var firebaseAdmin = require('./admin')

var app = express();

//html 空白頁面壓縮
app.use(minifyHTML({
    override:      true,
    exception_url: false,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

//firebase-admin
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const database = firebase.firestore();
const FirestoreStore = require("firestore-store")(session);


app.use(session({
   store: new FirestoreStore({
    database,
  }),

  secret: 'wayne_shop', //輸入自己的名稱
  resave: true, //重複儲存 session
  saveUninitialized: false,//避免一開始就建立使用者 session (可以節省空間)
  cookie: {
    httpOnly: false
  },
}))

global.admin = admin; //設定全域引用
global.db = admin.firestore(); //設定全域引用

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use("/returnNeweb", (req,res) =>{
  res.redirect("/?pay=" + req.query.pay)
})
app.use("/returnEcpay", (req,res) =>{
  res.redirect("/?pay=" + req.query.pay)
})


app.use("/admin",firebaseAdmin);  //admin 安裝 (請放在這個位置)

// app.use(middle1);

app.use("/*",(async(req,res,next)=>{  //所有請求都會經過

   //處理session
  let cart = req.session.cart || [];
  if(req.originalUrl == "/addCart"){
    let product = JSON.parse(req.body.data);//產品資料
    let order_number = req.body.number;
    //先移除相同 id 的產品
    cart = cart.filter(item => item.id != product.id);
    cart.push({//存入商品進購物車
      ...product, //偷懶作法，我把整個產品資訊都存進去了，實務上只存需要的資訊(例如 id)
      order_number: order_number //數量
    })
  }
  if(req.originalUrl.indexOf("/removeCart")>-1){
    let id = req.query.id; //產品id
    cart = cart.filter(item => item.id != id);
  }
  req.session.cart = cart;

  //處理
  //  var idToken = req.query.idToken;
  // if(idToken){ //使用 token 驗證
  //   try {
  //     let decodedToken = await admin
  //          .auth()
  //          .verifyIdToken(idToken);
  //       // console.log(decodedToken,"decodedToken")

  //       res.locals.session = {
  //         displayName: decodedToken.name || "使用者",
  //         uid : decodedToken.uid,
  //         email: decodedToken.email
  //      }

  //   }catch (err) {
  //       res.errorInfo = err.errorInfo; //把錯誤訊息傳到 res 物件
  //       console.log(err,"err")
  //   }
  // }


  // console.log(req.sessionID)
  // console.log(req.session.uid,"req.session")
  res.locals.session = req.session; // 將session 保存在 res 給 ejs 使用
  res.locals.session = res.locals.session || {}; //防止都沒資料

  next()
}));
//認證會員 middleware
app.use(['/account.html','/favorites.html','/personal.html','/settings.html'], auth);


app.use('/', indexRouter);
app.use('/order', orderRouter);
app.use('/api/member', memberRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404');
  // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
