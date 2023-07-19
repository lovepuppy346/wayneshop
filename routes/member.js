var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth');
var Member = require("../models/member"); //Member 建構式
//登入
router.post('/login', async function(req, res, next) {
  let data = req.body;
  let member = new Member();
  try{
    let result = await member.loginMember(data.email,data.password);
    console.log(result,"result")
    //session保留使用者資料
    req.session.displayName = result.data.displayName || "使用者"
    req.session.uid = result.data.localId; //寫入使用者的 uid
    req.session.email = result.data.email; //寫入 email

    res.json({
      success:true,
      idToken: result.data.idToken,
      refreshToken : result.data.refreshToken,
    })
  }catch(err){
    return res.status(500).json({ err: true, message : err.response.data.error})
  }
})
//登出
router.get("/logout", async function(req, res, next) {
  req.session.destroy((err) => {
     res.redirect('/') 
     //res.json({success: true}) //呼叫 api 用
  });
})

//忘記密碼
router.post('/forgetEmail', async function(req, res, next) {
  let email = req.body.email
  let member = new Member();
  try{
    await member.forgetEmail(email); //寄送忘記密碼認證信
    res.json({success:true})
  }catch(err){
    return res.status(500).json({ err: true, message : err.response.data.error})
  }
})


//註冊會員
router.post('/add', async function(req, res, next) {
  let data = req.body;
  //TODO後端驗證欄位
  if(1 == -1) return res.status(400).json({err:true,message:"欄位驗證出錯"})

  let member = new Member(data);
  //新增會員
  try{
    let result = await member.add();
    if(result.err) { //代表有錯
      return res.status(500).json({ err: true, message: result.err})
    }
  }catch(err){
    return res.status(500).json({ err: true, message: err.toString()})
  }
    //發送驗證信件
   try{
    let result = await member.loginMember(data.email,data.password);//執行登入
    await member.sendVerifyEmail(result.data.idToken); //寄送會員認證信
    res.json({
      success:true,
      idToken: result.data.idToken,
      refreshToken : result.data.refreshToken,
    })
  }catch(err){
    return res.status(500).json({ err: true, message: err.toString()})
  }
//   res.json({success:true})
});

//更新
router.post("/update", auth, async function(req, res, next) {
  let data = req.body;
  let member = new Member();
  //檢查當前密碼是否為現在會員的密碼
  try{
    await member.loginMember(res.locals.session.email,data.currentPassword);
  }catch(err){
    return res.redirect('/settings?err=password_error')
  }

  try{
    let result = await member.update(res.locals.session.uid,data);
    if(result.err) return res.redirect('/settings?err=' + result.err)
    // console.log(result.err);
  }catch(err){
    return res.redirect('/settings?err=1')
    console.log(err,"err")
  }
  // return res.send("ok")
  return res.redirect('/settings')
})
module.exports = router;
