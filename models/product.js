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

    //取得單一產品內容
    this.getProductOne = async (id) => {
      let result = await db.collection("PRODUCT").doc(id).get();
      let product = {};
      if(result.data() && result.data().open){
        product = {
          id,
          ...result.data()
        }
      }
      return product;
    }

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

    this.getProductCount = async () => {
       //統計主分類的產品數量
       let result = await db.collection("PRODUCT").where("open","==",true).get();
       var count = {}
       var _count = 0
        result.forEach((doc)=>{
          if(doc.data()){
            var data = doc.data();
            if(!data.productClassMain) return
            if(count[data.productClassMain] == undefined) count[data.productClassMain] = 0;
            count[data.productClassMain] = count[data.productClassMain] + 1;
            _count = _count + 1
          }
        })
       count._count = _count
       return count
    };

    //首頁精選資料
    this.getProductIndexByStar = async () => {
      let result = db.collection("PRODUCT");
      result = result.where("index_star","==",true);
      result = result.where("open", "==", true);
      result = result.orderBy("sort","desc");
      result = result.orderBy("updateAt","desc");
      result = result.limit(10);//只抓十筆資料
      result = await result.get();
      let data = [];
      if(result.size > 0){
        result.forEach((doc)=>{ 
         data.push({
             ...doc.data(),
             id: doc.id,
             description: null //移除不必要的資訊(避免一次載入太多資訊)
         })
        })
      }
      return data; 
    }

    //載入主分類產品列表
    // this.getProductByMain = async (id,sort,by,lastId) => {
    //   let result = db.collection("PRODUCT");
    //   by = (by>0) ? "desc" : "asc";
    //   result = result.where("productClassMain","==",id);
    //   result = result.where("open", "==", true);
    //   if(sort == "price") {
    //     result = result.orderBy("money", by);
    //     result = result.orderBy("updateAt","desc");
    //   }

    //   if(lastId){
    //     //取得文檔快照
    //     //let lastDoc = await db.collection("PRODUCT").doc(lastId).get()
    //     result = result.startAfter(lastDoc)
    //   }

    //   result = result.limit(20)
    //   result = await result.get();
    //   let data = [];
    //   if(result.size > 0){
    //     lastDoc = result.docs[result.docs.length-1]; //純前端可用此方式記入最後一筆快照(只限滾動式分頁)
    //     // lastId = result.docs[result.docs.length-1].id; //純前端可用此方式記入最後一筆快照(只限滾動式分頁)，更新最後一筆資料的id
        
    //     result.forEach((doc)=>{ 
    //      data.push({
    //          ...doc.data(),
    //          id: doc.id,
    //          description: null //移除不必要的資訊(避免一次載入太多資訊)
    //      })
    //     })
    //   }
    //   return {
    //     lastId,
    //     data
    //   }; 
    // }
      this.saveProductIndex =  async (result,limit) => {
        //此物件也可交由後台寫入，避免使用者第一次沒資料 loading 太久
        //後台新增更改刪除產品資料(會影響到順序的)都要把 global 清空
        result = await result.get();
        let data = []
        for(let i=0;i<result.docs.length;i++){
          if(i==0) {
            data.push("");
            continue;
          }
          if(i%(limit) == 0 ) {
            data.push(result.docs[i-1].id);
          }
        }
        console.log("temporary load")
        return data;
      }

      this.getProductByMain = async (id,sort,by,index,limit) => {
        let result = db.collection("PRODUCT");
        by = (by>0) ? "desc" : "asc";
        result = result.where("productClassMain","==",id);
        result = result.where("open", "==", true);
        if(sort == "price") {
          result = result.orderBy("money", by);
          result = result.orderBy("updateAt","desc");
        }
        
        var temporary = id+"_"+sort+"_"+by+"_"+limit //暫存的物件
        if(!global.product) global.product = {}
        if(!global.product[temporary]){
          global.product[temporary] = await this.saveProductIndex(result,limit);
        }

        if(index<=0) index = 1;
        if(index >= global.product[temporary].length) index = global.product[temporary].length
  
        var lastId = global.product[temporary][index-1];
        if(lastId) {
          var lastDoc = await db.collection("PRODUCT").doc(lastId).get(); //後端用 id 查出快照
          result = result.startAfter(lastDoc);
        }
        if(limit) result = result.limit(limit);
        result = await result.get();
        let data = [];
        if(result.size > 0){
          //lastDoc = result.docs[result.docs.length-1]; 純前端可用此方式記入最後一筆快照(只限滾動式分頁)
          result.forEach((doc)=>{ 
          data.push({
              ...doc.data(),
              id: doc.id,
              description: null //移除不必要的資訊(避免一次載入太多資訊)
          })
          })
        }
        return {
          data,
          pagination: global.product[temporary] || [],
          index
        }
    }

    //取得隨機產品
    this.getProductRandom = async (id,productClass) => {
      let result = db.collection("PRODUCT");
      result = result.where("productClass","==",productClass);
      result = result.where("open", "==", true);
      result = await result.get();
      
      let data = [];
      if(result.size > 0){
        result.forEach((doc)=>{
         if(doc.id == id) return
         data.push({
             ...doc.data(),
             id: doc.id,
             description: null //移除不必要的資訊(避免一次載入太多資訊)
         })
        })
      }
      data = data.sort(() => Math.random() - 0.5)//隨機排序
      data = data.slice(0,7) //最多四筆
      
      return data; 
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