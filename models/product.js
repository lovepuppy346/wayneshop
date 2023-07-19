let Product = function(data){
    this.version = "v1.0"; //this 宣告的變數或物件會曝露出去
    let new_data = data; //接收傳進來的參數
    this.demo = () => {};
    this.add = async (add_data) => {
        let data = new_data || add_data;
        // return {  //回傳 err 代表某些情境失敗無法新增
        //     err: true
        // } 
        return await db.collection("PRODUCT").add({
            ...Product.prototype.product,
            ...data
        })
    }
    // this.save = async(save_data) => {
    //     console.log(data,"data")
    //     return "我是回傳值"
    // }
    this.getProduct = async() => {
        let result = await db.collection("PRODUCT")
        // .where("productClassMain", "==", "a111")
        .where("name", "==", "電腦")
        .orderBy("money","desc")
            .get()

        let data = [];
        console.log(result.size,"result.size");
        result.forEach((doc)=>{ 
        //這邊可以做篩選有適合的資料才做 push
        let seconds = doc.data().createdAt.seconds;
        console.log(timestampToDate(seconds));
        data.push({
            ...doc.data(),
            id: doc.id
        })
        })
        return data 

    };
    this.getProductClassMain = async() => {
        let result = await db.collection("PAGE").doc("productClassMain").get()
        // console.log(result.data());
        return result.data()
    };
    this.delete = (id) => {
       return  db.collection("PRODUCT").doc(id).delete();
    };
    this.update = (id,update_data) => {
       return db.collection("PRODUCT").doc(id).set({
        ...update_data,
        updateAt : admin.firestore.FieldValue.serverTimestamp()
    },{merge:true});
    };
    this.updateList = async() => {
        let result = await db.collection("PRODUCT").get();
        var batch = db.batch();

        result.forEach((doc)=>{
            batch.update(doc.ref,{b:555});
        })

        batch_result = await batch.commit()
        return "ok"
        
         result = await db.collection("PRODUCT")
        // .where("name", "==", "電腦")
        .get()

         for(let i=0;i<result.docs.length;i++){
         await result.docs[i].ref.update({b:1})
        }
        return "ok"
    }
    //新增資料
    this.add =  (add_data) => {
            let data = new_data || add_data;
            // return {  //回傳 err 代表某些情境失敗無法新增
            //     err: true
            // } 
            return  db.collection("PRODUCT").add({
                ...Product.prototype.product,
                ...data,
                createdAt : admin.firestore.FieldValue.serverTimestamp()
            })
        }
}

Product.prototype  = { //使用原型屬性
    product: { //產品資料表結構
      "name":"",//產品名稱
      "productClassMain":"",//主分類 id
      "productClass":"",//次分類 id
      "img":"",//產品圖示
      "p_img":"",//產品輪播圖
      "money": 0, //訂價
      "price": 0, //目前價錢
      "star" : 5, //評價星號
      "content": "", // 產品介紹
      "keyWord": "", //產品關鍵字
      "inventory": 0, //產品庫存
      "sort":0,//排序
      "open": true, //是否上架
      "_tag":[],//產品標籤
      "updateAt": "",//產品更新時間
      "createdAt": "" //建立時間
    },
    productClassMain:{ //主分類結構
      "id":"",//分類 id
      "name" : "",//分類名稱
      "img" : "",//分類圖示
      "checked": true,//開關
    },
    productClass : { //次分類結構
        "id":"",//分類 id
        "name":"",//分類名稱
        "checked": true//開關
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


module.exports = Product