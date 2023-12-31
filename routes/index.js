var express = require('express');
var router = express.Router();

var Product = require("../models/product");//Product 建構式
var Member = require("../models/member");//Member 建構式

/* GET home page. */
router.get('/', async function(req, res, next) {
  let product = new Product();
  let product_list = [];
  try{
    product_list = await product.getProductIndexByStar();
  }catch(err){
    console.log(err,"err")
  }
  res.render('index', { title: '韋恩購物網', product_list });
})

router.get('/demo', async function(req, res, next) {

  //  var ref  = db.collectionGroup("ORDER").where("idno","==", "60912476643710");
  //   var querySnapshot = await ref.get();
  //   if(querySnapshot.empty) res.send("error");
    
  //   for(var i=0;i<querySnapshot.docs.length;i++){
  //     await querySnapshot.docs[i].ref.update({
  //         source: 2,
  //         PaymentDate: "PayTime",
  //         PaymentType: "PaymentType",
  //         TradeNo: "TradeNo",
  //         pay: true,
  //         status : 1
  //     })
  //   }
  //   return res.send("OK");

    // let member = new Member()
    // await member.add()

    // res.render('demo', { title: 'demo' });

    let product = new Product()
    // let data = await product.updateList()
    // // let data = await product.getProductClassMain()
    // console.log(data,"data")
    // res.render('demo', { title: 'demo' });

    // try{
    //     let result = await product.delete("RPm3CyG9CXVVGj1VMcnL",{
    //         name: '電腦'
    //     });
    //     if(result.err) console.log("代表有錯")
    //     console.log(result.id,"result")
    // }catch(err){
    //     //這邊是呼叫 firestore 失敗
    //     console.log(err,"err")  
    // }
  try{
    let result = await product.add({
      name: "我是產品1",
    });
    if(result.err) console.log("代表有錯")
    console.log(result.id,"result")
  }catch(err){    //這邊是呼叫 firestore 失敗
    console.log(err,"err")  
  }
    //   let productClassMain = [
    //     {
    //         "id":"K001",
    //         "name" : "筆記本電腦和平板電腦",
    //         "img" : "https://chekromul.github.io/uikit-ecommerce-template/images/catalog/computers.svg",
    //         "checked": true,
    //         "productClass" : [{ // 沒次分類可省略
    //                 "id":"K001_C001",
    //                 "name":"筆記本電腦",
    //                 "checked": true
    //             },
    //             {
    //                 "id":"K001_C002",
    //                 "name":"平板電腦",
    //                 "checked": true
    //             },
    //             {
    //                 "id":"K001_C003",
    //                 "name":"鍵盤",
    //                 "checked": true
    //             }]
    //     },{
    //         "id":"K002",
    //         "name" : "手機和小工具",
    //         "img" : "https://chekromul.github.io/uikit-ecommerce-template/images/catalog/phones.svg",
    //         "productClass" : [{
    //                 "id":"K002_C001",
    //                 "name":"手機",
    //                 "checked": true
    //             },
    //             {
    //                 "id":"K002_C002",
    //                 "name":"配件",
    //                 "checked": true
    //             }
    //         ]
    //     },
    //     {
    //         "id":"K003",
    //         "name" : "電視和視頻",
    //         "img" : "https://chekromul.github.io/uikit-ecommerce-template/images/catalog/tv.svg",
    //         "productClass" : [],
    //         "checked": true
    //     },
    //     {
    //         "id":"K004",
    //         "name" : "遊戲與娛樂",
    //         "img" : "https://chekromul.github.io/uikit-ecommerce-template/images/catalog/games.svg",
    //         "productClass" : [],
    //         "checked": true
    //     },
    //     {
    //         "id":"K005",
    //         "name" : "照片",
    //         "img" : "https://chekromul.github.io/uikit-ecommerce-template/images/catalog/photo.svg",
    //         "productClass" : [],
    //         "checked": true
    //     }
    // ]

    //    let data = await db.collection("PAGE").doc("productClassMain").set({
    //     "data": productClassMain,
    //     "updateAt": admin.firestore.FieldValue.serverTimestamp(),//更新時間
    // })

  //    let product = new Product({ //建立一個 產品實體
  //     id: 123,
  //     name:"測試產品"
  // });

    // let data = await product.save(); //{id:456,name:"other"}
    //   console.log(data);
    // console.log(Product.prototype)
      // console.log(product.version,"product.version");
      //product.demo();
      //  res.render('demo', { title: 'demo' });

});


router.get('/news.html', function(req, res, next) {
 res.render('news', { title: 'Express' });
});

router.get('/about.html', function(req, res, next) {
 res.render('about', { title: 'Express' });
});

router.get('/account.html', function(req, res, next) {
 res.render('account', { title: 'Express' });
});

router.get('/article.html', function(req, res, next) {
 res.render('article', { title: 'Express' });
});
router.get('/blog.html', function(req, res, next) {
 res.render('blog', { title: 'Express' });
});

router.get('/brands.html', function(req, res, next) {
 res.render('brands', { title: 'Express' });
});
router.get('/cart.html', function(req, res, next) {
  
 res.render('cart', { title: 'Express' });
});

router.get('/catalog.html', async function(req, res, next) {
  let product = new Product();
  let count = {}
  try{
    count = await product.getProductCount();
  }catch(err){
    console.log(err,"err")
  } 
  console.log(count,"count")
  res.render('catalog', { title: '產品目錄', count });
 });

// router.get('/category.html', async function(req, res, next) {
//   let id = req.query.id || "";
//   let sort = req.query.sort || "money"
//   let by = req.query.by || 1 ;
//   let lastId = req.query.lastId || ""

//   if(!id) return res.redirect("/");
   
//   let product = new Product();
//   let product_list = [];
//   try{
//     product_list = await product.getProductByMain(id,sort,by,lastId);
//   }catch(err){
//     console.log(err,"err")
//   }
//   // console.log(product_list,"product_list")

//   res.render('category', { title: '產品分類', 
//       product_list: product_list.data,
//       lastId: product_list.lastId , 
//       id,
//       by,
//       sort 
//   });
//  })
router.get('/category.html', async function(req, res, next) {
  let id = req.query.id || "";
  let sort = req.query.sort || "price"
  let by = req.query.by || 1 ;
  if(!id) return res.redirect("/");
   
  let index = Number(req.query.index) || 1;
  let limit = 20;//每頁筆數
  let product = new Product();
  let product_data = {};
  try{
    product_data = await product.getProductByMain(id,sort,by,index,limit);
  }catch(err){
    console.log(err,"err")
  }
  
  res.render('category', {
    title: '產品分類', 
    product_list:product_data.data,
    id,
    by,
    sort,
    index: product_data.index,
    pagination: product_data.pagination || []
  });
 })

router.get('/checkout.html', function(req, res, next) {
 res.render('checkout', { title: 'Express' });
});
router.get('/compare.html', function(req, res, next) {
 res.render('compare', { title: 'Express' });
});
router.get('/category.html', function(req, res, next) {
 res.render('category', { title: 'Express' });
});
router.get('/contacts.html', function(req, res, next) {
 res.render('contacts', { title: 'Express' });
});
router.get('/delivery.html', function(req, res, next) {
 res.render('delivery', { title: 'Express' });
});
router.get('/faq.html', function(req, res, next) {
 res.render('faq', { title: 'Express' });
});
router.get('/favorites.html', function(req, res, next) {
 res.render('favorites', { title: 'Express' });
});
router.get('/news.html', function(req, res, next) {
 res.render('news', { title: 'Express' });
});
router.get('/personal.html', async function(req, res, next) {
 //取得使用者個人的資料
  let member = new Member();
  let userRecord = {}
  try{
    userRecord = await member.getMember(res.locals.session.uid);
    console.log(userRecord,"userRecord")
  }catch(err){
    console.log(err,"err")
  }
  
  res.render('personal', { title: '個人資訊',userRecord});
});

router.get('/product.html', async function(req, res, next) {
  let id = req.query.id || "";
  if(!id) return res.redirect("/");
  let product = new Product();
   
  let product_data = {};
  let product_list = [];
   
  try{
    product_data = await product.getProductOne(id);
  }catch(err){
    console.log(err,"err")
  }
  if(!product_data) return res.redirect("/"); //沒有資料
  
  product_list = await product.getProductRandom(id,product_data.productClass);//使用子分類
  console.log(product_list,"product_list")
  res.render('product', { title: '產品頁', product: product_data, product_list});
 });

router.get('/settings.html', function(req, res, next) {
    var err = req.query.err
 res.render('settings', { title: '設定', err });
});
router.get('/subcategory.html', function(req, res, next) {
 res.render('subcategory', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
 res.render('login', { title: 'Express' });
});

module.exports = router;
