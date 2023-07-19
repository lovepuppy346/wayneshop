var express = require('express');
var router = express.Router();
var Order = require("../models/order");//Order 建構式

const crypto = require('crypto');//加解密套件
const ecpay_payment = require('../ECPAY_Payment_node_js');

const pay_env = require('../firebase/functions/pay.env')
const env = {
  ...pay_env(process.env.NODE_ENV,1)
}

router.post('/', async function(req, res, next) {
  let data = JSON.parse(req.body.data);//產品資料

  var idno = data.idno || "";
  var total = data.total || 0;
  var itemName = data.itemName || "沒有名稱";//目前沒有
  var discount_money = data.discount_money || 0
  var discount = data.discount || ""
  var email = data.people.email || "";
  var Remark = "" //交易備註
  if(discount) Remark = discount + "_" + discount_money;//折扣碼寫入交易備註


  //TODO 簡查訂單的正確性 (例如：金額是否有造假)  
  // 使用產品id 去資料庫比對該產品的單價，是否和傳過來的一樣  
  // 如果有折扣碼、運費、含稅要在檢查一次
  let uid = req.session.uid || ""; //使用 session 找 uid
  let order = new Order();
  await order.add(uid,{
    ...data
  });

  //綠界1 
  //一般信用卡測試卡號 : 4311-9522-2222-2222 安全碼 : 222
  if(env.source == 1){

    let base_param = {
      MerchantTradeNo: idno, //20碼內 訂單編號
      MerchantTradeDate: getFromFormat('yyyy/mm/dd hh:ii:ss'), //ex: 2018/02/13 15:45:30
      TotalAmount: Number(total), //200
      TradeDesc: "購物車網站商品購買", //*
      ItemName: itemName, //產品名稱
      ReturnURL: env.firebase_functions_ecpay,
      OrderResultURL:env.web_url + "/returnEcpay?pay=1",
      PaymentInfoURL: "",
      ClientBackURL: env.web_url + "/?pay=2", // 支付取消返回商店網址,
      InvoiceMark: 'Y',
      Remark: Remark,
      CustomField1: ''
    };

     let create = new ecpay_payment({
        "OperationMode": env.OperationMode, //Test or Production
        "MercProfile": {
          "MerchantID": env.MerchantID,
          "HashKey": env.HashKey,
          "HashIV": env.HashIV
        },
        "IgnorePayment": ["WebATM","BARCODE","CVS"], //隱藏付款方式(測試台無效)：文件22頁 IgnorePayment 
        "IsProjectContractor": false //是否為特約商店：文件22頁 PlatformID 
      }); 

      // 電子發票
let inv_params = {};
if(env.ecpay_invoice){
  var invoice = data.invoice || {};
  var CarruerNum = "";
  var Donation = "0";
  var LoveCode = "";
  var print = "0";
  var eInvoice = invoice.eInvoice || "";
  var CustomerID = idno;
  var CustomerAddr = "";

  if(invoice.invoiceType == '電子發票'){
    if(invoice.eInvoice == "2") CarruerNum = invoice.npcBarCode;
    if(invoice.eInvoice == "3") CarruerNum = invoice.mobileBarCode;
  }
  if(invoice.invoiceType == '捐贈發票'){
    Donation = "1";
    LoveCode = invoice.LoveCode;
  }
  if(invoice.invoiceType == '統編發票'){
    if(invoice.CustomerIdentifier.length > 0){
      print = "1";
      eInvoice = "";
    }
    CustomerID = "";
    CustomerAddr = invoice.taxAddr || ""
  }
  var InvoiceItemName = "";
  var InvoiceItemCount = "";
  var InvoiceItemWord = "";
  var InvoiceItemPrice = "";
  var InvoiceItemTaxType = "";

  for(var i=0;i<data.order.length;i++){
    if(i>0) {
      InvoiceItemName = InvoiceItemName + "|";
      InvoiceItemCount = InvoiceItemCount + "|";
      InvoiceItemWord = InvoiceItemWord + "|";
      InvoiceItemPrice = InvoiceItemPrice + "|";
      InvoiceItemTaxType = InvoiceItemTaxType + "|";
    }
    InvoiceItemName = InvoiceItemName + data.order[i].name;
    InvoiceItemCount = InvoiceItemCount + data.order[i].order_number;
    InvoiceItemWord = InvoiceItemWord + "個";
    InvoiceItemPrice = InvoiceItemPrice + data.order[i].money;
    InvoiceItemTaxType = InvoiceItemTaxType + "1";
  }
  inv_params = {
    RelateNumber: idno,  //請帶30碼uid
    CustomerID,  //會員編號
    CustomerIdentifier: invoice.CustomerIdentifier || "",   //統一編號
    CustomerName:  data.people.displayName,
    CustomerAddr,
    CustomerPhone: '',
    CustomerEmail: email,
    ClearanceMark: '1',
    TaxType: '1',
    CarruerType: eInvoice,
    CarruerNum,
    Donation,
    LoveCode,
    Print: print,
    InvoiceItemName,
    InvoiceItemCount,
    InvoiceItemWord,
    InvoiceItemPrice,
    InvoiceItemTaxType,
    InvoiceRemark: "",//發票註記
    DelayDay: 0,//延遲天數，開發票的天數，避免使用者退款
    InvType: '07'
  }
}
try {
  var htm = create.payment_client.aio_check_out_all(base_param, inv_params);
  console.log(htm)
} catch (error) {
  console.log(error);
  return res.json({
      err : true
    })
}


  }else if(env.source == 2){
     //藍新2
    //資料加密
     var aes256 = create_mpg_aes_encrypt({
      MerchantID: env._MerchantID, // 商店代號
      RespondType: "JSON", // 回傳格式
      TimeStamp: Date.now(), // 時間戳記
      Version: 1.6, // 串接程式版本
      MerchantOrderNo: idno, // 商店訂單編號
      LoginType: 0, // 不須登入藍新金流會員
      OrderComment: Remark, // 商店備註
      Amt: Number(total), // 訂單金額
      ItemDesc: itemName, // 產品名稱
      Email: email, // 付款人電子信箱
      ReturnURL: env.web_url + "/returnNeweb?pay=1", // 支付完成返回商店網址(post)
      NotifyURL: env.firebase_functions, // 支付通知網址/每期授權結果通知
      ClientBackURL: env.web_url + "/home?pay=2" // 支付取消返回商店網址
    });
    //組合在加密
     var parameter = `HashKey=${env._HashKey}&${aes256}&HashIV=${env._HashIV}`;
     var sha = crypto.createHash("sha256")
              .update(parameter)
              .digest("hex") //16進位的編碼
              .toUpperCase(); //轉大寫

     var htm = `
          <form id="_form_aiochk" action="${env.action}" method="post">
          <input type="hidden" name="MerchantID" value="${env._MerchantID}" />
          <input type="hidden" name="TradeInfo" value="${aes256}" />
          <input type="hidden" name="TradeSha" value="${sha}" />
          <input type="hidden" name="Version" value="1.6" />
          <input type="hidden" name="TokenTerm" value="${email}" />
          <input type="hidden" name="TokenTermDemand" value="1" />
          <script type="text/javascript">
            document.getElementById("_form_aiochk").submit();
          </script>
        </form>
      `

  }
      res.json({
      htm: htm
    })
  // res.send('ok');
});

//取得一個訂單編號
router.get('/getOrderId', async (req, res) => {
  var secret = req.query.secret || "default"
  const orderid = require('order-id')(secret);
  let id = orderid.generate();
  
  id = id.replace("-","").replace("-",""); //訂單編號的格式
  res.send(id)
})

//加密方式
function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv("aes256", env._HashKey, env._HashIV);//初始化加密
  let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex"); //開始加密/輸入/輸出(update)
  enc += encrypt.final("hex"); //停止加密(final)
  return enc;
}
function genDataChain(TradeInfo) {
  //將資料輸出成&的格式
  let results = [];
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`);
  }
  return results.join("&");
}

function getFromFormat(format) {
  var d = new Date();
  var yyyy = d.getFullYear().toString();
  format = format.replace(/yyyy/g, yyyy)
  var mm = (d.getMonth()+1).toString(); 
  format = format.replace(/mm/g, (mm[1]?mm:"0"+mm[0]));
  var dd  = d.getDate().toString();
  format = format.replace(/dd/g, (dd[1]?dd:"0"+dd[0]));
  var hh = d.getHours().toString();
  format = format.replace(/hh/g, (hh[1]?hh:"0"+hh[0]));
  var ii = d.getMinutes().toString();
  format = format.replace(/ii/g, (ii[1]?ii:"0"+ii[0]));
  var ss  = d.getSeconds().toString();
  format = format.replace(/ss/g, (ss[1]?ss:"0"+ss[0]));
  return format;
  //yyyy-mm-dd hh:ii:ss
};
module.exports = router;
