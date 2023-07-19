let Order = function(){

     this.add = (uid,data) => {
        let idno = data.idno || "";
        let ref = db.collection("ORDER").doc(idno)
        if(uid) ref = db.collection("MEMBER").doc(uid).collection("ORDER").doc(idno);
        return ref.set({
            ...Order.prototype.order,
            ...data,
            createdAt : admin.firestore.FieldValue.serverTimestamp(),
            pay: Order.prototype.order.pay, //保守起見，強制將 pay 寫入預設值，避免前端寫入此屬性
            status:Order.prototype.order.status //同上
        })
    }
}

Order.prototype  = { //使用原型屬性
    order:{ //訂單資料
                    "idno":"",
                    "people": {
                        "displayName":"" , //會員名稱
                        "email": "",
                        "uid": "" //會員 uid
                    }, //會員資料
                    "order": [{
                        id: "",//產品id
                        money: 0,
                        order_number: 1,
                        name: "",
                    }],//訂單資訊
                    "order_list": [], //訂單資訊-查詢用
                    "total": 0, //實際付款總額
                    "ship": 0, //運費
                    "discount": "", //折扣碼
                    "discount_money": 0, //折扣金額,
                    "pay":false, //是否透過金流管道付款
                    "status": 0, //付款狀態 (0未付款1已付款2已刪除)
                    "PaymentDate":"",//付款日期 (金流商回傳)
                    "PaymentType":"",//付款方式 (金流商回傳)
                    "TradeNo":"",//金流對帳編號 (金流商回傳)
                    "invoice": {}
                }
  }

  function timestampToDate(timestamp){
  var date = new Date(timestamp * 1000);
    var mm = date.getMonth() + 1; 
    var dd = date.getDate();
    var hh = date.getHours()
    var nn = date.getMinutes();
    hh = (hh>9 ? '' : '0') + hh
    nn = (nn>9 ? '' : '0') + nn
    return [date.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd,
         ].join('/') + " " +hh+"時"+nn+"分" ;
} 


module.exports = Order