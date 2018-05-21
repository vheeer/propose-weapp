//index.js
//获取应用实例
const app = getApp();
const config = require('../../config.js');

Page({
  data: {
    goodsList: [],
    bannars: [
      "https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/4bbba384040ba2cb8932917fa47ee051.jpg"
    ]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    const that = this;
    //加载数据
    this.loadData();
  },
  onShow: function() {
    this.setData({
      main_data: app.globalData.main_data
    })
  },

  // 主页信息
  loadData(){
    const that = this;
    wx.request({
      url: config.host + '/goods/read?order=sort_order%20asc&page=1&pageSize=99',
      method: "GET",
      success: function (res) {
        const goods_list = res.data.data.data;
        const final_list = [...that.data.goodsList, ...goods_list];
        // 添加全局商品列表
        app.globalData.goodsList = final_list;
        // 本页添加商品列表
        that.setData({
          goodsList: final_list
        });
      }
    })
  },
  onShareAppMessage(options){
    console.log(options);
  },
  choose(e) {
    const { goods_id, retail_price, name } = e.currentTarget.dataset;
    console.log(retail_price);
    console.log(parseFloat(0.02));
    if(retail_price  === parseFloat(0.02))
    {
      wx.showToast({
        title: '已收到' + name,
      })
      return false;
    }
    wx.navigateTo({
      url: '../edit/edit?goods_id=' + goods_id
    });
  },
  // 滚动条触底
  down: function () {
    const that = this;
    console.log("down");
    this.loadData(this.data.page + 1);
  },
  // 正在滚动
  scroll: function () {
    console.log("scroll");
  },
})
