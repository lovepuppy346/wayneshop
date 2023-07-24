const env =  function(NODE_ENV,source){
    

    let env = {  //環境變數 (dev)
        source: source, //綠界1 藍新2
        web_url: "http://localhost:6886",//目前網址
        firebase_functions: "https://asia-east1-wayneshop-5789b.cloudfunctions.net/payReturnSuccessNewebDev",//付款回傳程式網址(使用 firebase functions)
        firebase_functions_ecpay: "https://asia-east1-wayneshop-5789b.cloudfunctions.net/payReturnSuccessEcpayDev",//付款回傳程式網址(使用 firebase functions)
        _MerchantID : "MS149628076",//藍新
        _HashKey : "1Ta03r8eBtWZ5zILQGGE4VQ3pllVCgHI",//藍新
        _HashIV : "CZoT09yzQjmZItmP",//藍新
        action: "https://ccore.newebpay.com/MPG/mpg_gateway",//藍新串接網址
        MerchantID : "2000132",//綠界
        HashKey : "5294y06JbISpM5x9",//綠界
        HashIV : "v77hoKGq4kWxNNIS",//綠界
        OperationMode : "Test",//綠界
        ecpay_invoice: true, //綠界發票
        adminlogin : "test7489", //firebase管理者識別用(類似密碼，無外流)
        adminEmail : "test@gmail.com",//最高管理者的 email
        firebase_api_key : "AIzaSyALA6oyfglngUWUwcl_snykCApPGmWRam0"
        }
        if(NODE_ENV == "prod"){ //填寫正式環境的env
            env = require('./env')(source);
        }
    return env;

}
module.exports = env