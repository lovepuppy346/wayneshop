module.exports = {
   apps : [{
       name: 'wayne_shop',
       script: './bin/www',
       instances: 'max', //負載平衡模式下的 cpu 數量
       exec_mode : "cluster", //cpu 負載平衡模式
       max_memory_restart: '500M', //緩存了多少記憶體重新整理
       port: 6887, //指定伺服器上的 port
   }]
};