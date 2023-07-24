
const functions = require('firebase-functions/v1').region('asia-east1');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

//控制逾時時間及記憶體
const runtimeOpts = {
  timeoutSeconds: 120
  //memory: '1GB'
}
const crypto = require('crypto');//加解密套件
const pay_env = require('./pay.env');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
  //functions.logger.info("Hello logs!", {structuredData: true});
  let data = await db.collection("PRODUCT").doc("56UXh0ecTj70MtG0GgYW").get();
  console.log(data.data(),"data.data()");

  res.send("Hello from Firebase!");
});

//綠界
exports.payReturnSuccessEcpay = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
  const env = {
    ...pay_env("prod",1)
  }
  return payReturnSuccess(req,res,env);
});

exports.payReturnSuccessEcpayDev = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
  const env = {
    ...pay_env("dev",1)
  }
  return payReturnSuccess(req,res,env);
});

//藍新
exports.payReturnSuccessNeweb = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
  const env = {
    ...pay_env("prod",2)
  }
  console.log("藍新正式台測試")
  return payReturnSuccess(req,res,env);
});
exports.payReturnSuccessNewebDev = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
  const env = {
    ...pay_env("dev",2)
  }
  return payReturnSuccess(req,res,env);
});

async function payReturnSuccess (req,res,env){
    //   console.log(JSON.stringify(req.body) ,"JSON.stringify(req.body)")
    if(env.source == 1 ){
        var MerchantOrderNo = req.body.MerchantTradeNo;
        var RtnCode = Number(req.body.RtnCode);
        if(RtnCode !== 1) return res.send("error"); // 1表示交易成功
        var PayTime = req.body.PaymentDate;
        var PaymentType = req.body.PaymentType;
        var TradeNo = req.body.TradeNo;
        //驗證資訊
        var CheckMacValue = generateCheckMacValue(req.body,env.HashKey, env.HashIV);
        if(CheckMacValue != req.body.CheckMacValue) return res.send("error");
    }
    if(env.source == 2 ){
        //藍新
        const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo,env._HashKey,env._HashIV));
        var MerchantOrderNo = data["Result"]["MerchantOrderNo"];
        var PayTime = data["Result"]["PayTime"] || "";
        var PaymentType = data["Result"]["PaymentType"] || "";
        var TradeNo = data["Result"]["TradeNo"] || "";
        console.log(req.body.Status,"req.body.Status")
        if(req.body.Status !== 'SUCCESS') return res.send("error")
    }
    //共用程式
    //寫回訂單資料或開通產品 
      var ref  = db.collectionGroup("ORDER").where("idno","==", MerchantOrderNo);
        var querySnapshot = await ref.get();
        if(querySnapshot.empty) res.send("error");
        
        for(var i=0;i<querySnapshot.docs.length;i++){
        await querySnapshot.docs[i].ref.update({
            source: env.source ,
            PaymentDate: PayTime,
            PaymentType: PaymentType,
            TradeNo: TradeNo,
            pay: true,
            status : 1
        })
        }
        return res.send("1|OK");
}

function create_mpg_aes_decrypt(TradeInfo,_hashKey, _hashIV) {
  let decrypt = crypto.createDecipheriv("aes256", _hashKey, _hashIV);
  decrypt.setAutoPadding(false); //取消自動填充加密資訊
  let text = decrypt.update(TradeInfo, "hex", "utf8");
  let plainText = text + decrypt.final("utf8");
  let result = plainText.replace(/[\x00-\x20]+/g, "");//把會判斷錯誤的空字符，濾掉
  return result;
}

//加密程式
const generateCheckMacValue = (data, hashKey, hashIV) => {
  const keys = Object.keys(data).sort();
  let checkValue = '';
  for(const key of keys){ 
    if(key != "CheckMacValue") checkValue += `${key}=${data[key]}&`
  }
  checkValue = `HashKey=${hashKey}&${checkValue}HashIV=${hashIV}`;
  checkValue = encodeURIComponent(checkValue).toLowerCase();
  checkValue = checkValue.replace(/%20/g, '+')
               .replace(/\'/g,"%27")
               .replace(/\~/g,"%7e");  

  checkValue = crypto.createHash('sha256').update(checkValue).digest('hex');
  checkValue = checkValue.toUpperCase();
  return checkValue;
}