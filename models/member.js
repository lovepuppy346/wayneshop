var axios = require('axios');
let firebase_api_key = "AIzaSyALA6oyfglngUWUwcl_snykCApPGmWRam0";

let Member = function(data){
    this.version = "v1.0"; //this 宣告的變數或物件會曝露出去
    let new_data = data; //接收傳進來的參數
    this.demo = () => {};
    this.getMember = async (uid) => {
      let data = await db.collection("MEMBER").doc(uid).get()
      return data.data()
    };
    this.delete = (id) => {
       return  db.collection("MEMBER").doc(id).delete();
    };
   this.update = async (uid,update_data) => {
      try{
        await admin.auth().updateUser(uid,{
          ...update_data
        })
      }catch(err){
        return {err: err.errorInfo.code}
      }
      return db.collection("MEMBER").doc(uid).set({
        ...update_data,
        password: null,
        currentPassword : null,
        updateAt : admin.firestore.FieldValue.serverTimestamp()
      },{merge:true})
    };


    //發送驗證信件
    this.sendVerifyEmail = async (idToken) => {
      return axios({
        method: "post",
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + firebase_api_key,
        headers: {
          'Content-Type': 'application/json' 
        },
        data: {
          requestType: "VERIFY_EMAIL",
          idToken
        }
      })
    }

    //登入
    this.loginMember = (email,password) => {
      return axios({
        method: "post",
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + firebase_api_key,
        headers: {
          'Content-Type': 'application/json' 
        },
        data: {
          email: email,
          password: password,
          returnSecureToken:true
        }
      })
    }
    //忘記密碼
    this.forgetEmail = async (email) => {
      return axios({
        method: "post",
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + firebase_api_key,
        headers: {
          'Content-Type': 'application/json' 
        },
        data: {
          requestType: "PASSWORD_RESET",
          email
        }
      })
    }




    //新增資料
    this.add = async (add_data) => {
        let data = new_data || add_data;
        let uid = "";
        //新增用戶 https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
        try{
          let userRecord = await admin.auth().createUser({
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: data.password,
            displayName: data.displayName,
            photoURL: data.photoURL
          })
          uid = userRecord.uid;//回傳 uid
        }catch(err){
          return {err: err.errorInfo.code} //回傳 code (https://firebase.google.com/docs/auth/admin/errors)
        }
        if(!uid) return { err: "新增失敗"}

        // delete data.password //密碼刪掉
        return db.collection("MEMBER").doc(uid).set({
            ...Member.prototype.member,
            ...data,
            createdAt : admin.firestore.FieldValue.serverTimestamp(),
            uid,
            password: null,
        })
    }

}

Member.prototype  = { //使用原型屬性
    member: { //產品資料表結構
       "uid":"", //會員 uid
    "email": "",//會員 email
    "displayName":"",//會員姓名
    "photoURL":"",//會員照片
    "emailNotification": false, //email 是否驗證
    "updateAt": "",//更新時間
    "createdAt": "" //建立時間
    },
    // productClassMain:{ //主分類結構
    //   "id":"",//分類 id
    //   "name" : "",//分類名稱
    //   "img" : "",//分類圖示
    //   "checked": true,//開關
    // },
    // productClass : { //次分類結構
    //     "id":"",//分類 id
    //     "name":"",//分類名稱
    //     "checked": true//開關
    // }
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


module.exports = Member