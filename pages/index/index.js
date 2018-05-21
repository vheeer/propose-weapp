//index.js
//获取应用实例
const app = getApp();
const config = require('../../config.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    productList: [],
    bannars: [
      "https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/%E5%A4%87%E7%94%A8.jpg"
    ],
    page: 0,
    markers: [{
      iconPath: "https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/%E5%A4%87%E7%94%A8.jpg",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }],
    polyline: [{
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      }, {
        longitude: 113.324520,
        latitude: 23.21229
      }],
      color:"#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    controls: [{
      id: 1,
      iconPath: 'https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/%E5%A4%87%E7%94%A8.jpg',
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }],
    loading: false
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    // 查看位置
    // wx.getLocation({
    //   type: 'gcj02', //返回可以用于wx.openLocation的经纬度
    //   success: function(res) {
    //     var latitude = res.latitude
    //     var longitude = res.longitude
    //     wx.openLocation({
    //       latitude: latitude,
    //       longitude: longitude,
    //       scale: 28
    //     })
    //   }
    // })
    // 选择位置
    // wx.chooseLocation({
      // success: (a, b) => {
        // console.log("a", a);
        // console.log("b", b);
      // }
    // })
    const that = this;
    // 用户信息
    if (app.globalData.userInfo) {
      this.setData({
        hasUserInfo: true
      })
    }else{
      wx.getUserInfo({
        fail: res => {
          console.log("user info fail res: ", res)
        },
        success: res => {
          console.log("user info", res);
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          const code = app.globalData.code;
          console.log("code", code);
          wx.request({
            url: config.host + '/user/add',
            method: "POST",
            data: Object.assign(res.userInfo, {code}),
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function(res){
              console.log("/user/add res", res);
              const { openid } = res.data.data;
              wx.setStorageSync('openid', openid);
              wx.request({
                url: config.host + '/product/myup',
                method: "POST",
                data: { openid },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function(res){
                  console.log("/product/myup res", res);
                  const myups = [];
                  for(const value of res.data.data)
                  {
                    myups.push(value['product_id']);
                  }
                  that.data.myups = myups;
                }
              })
            }
          })
        }
      });
    }
    //加载第一页数据
    this.loadData(this.data.page + 1);
    // 加载大图
    wx.request({
      url: 'https://www.dapingkeji.com/pay_dapingkeji/main_data?acc=123456@126.com',
      success: res => {
        console.log("big res", res);
        that.setData({
          data: res.data.main_data,
          goods: res.data.main_data.goods
        });
        app.globalData.main_data = res.data.main_data;
      }
    })
  },
  onShow: function(options) {
    console.log(options);
    if(app.globalData.refresh == 1)
    {
      // 刷新
      this.data.page = 0;
      this.data.productList = [];
      const loadResult = this.loadData(this.data.page + 1);
      app.globalData.refresh = 0;
    }
  },
  getPhoneNumber: function(e) {
    if(this.data.mobile){
      this.formSubmit();
      return false;
    }
    const that = this;
    console.log(e.detail.errMsg) 
    console.log(e.detail.iv) 
    console.log(e.detail.encryptedData)
    wx.request({
      url: config.host + '/admin/user/postNumber',
      data: {
        openid: wx.getStorageSync("openid"),
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        const { data } = res.data;
        app.globalData.result = data;
        
        if(res.data.errno == 0) {
          wx.setStorageSync("mobile", data)
          that.setData({
            mobile: data
          });
        }
      }
    });
  },
  // 加载主页信息

  // 主页信息
  loadData(page){
    return new Promise((resolve, reject) => {
      const that = this;
      // 显示正在加载
      this.setData({ loading: true });
      wx.request({
        url: config.host + '/product/read?order=add_time%20desc&page=' + page + '&pageSize=6&key=is_pay&value=1',
        method: "POST",
        success: function (res) {
          console.log("index loadData", res);
          const product_list = res.data.data.data;
          const final_list = [...that.data.productList, ...product_list];
          that.setData({
            productList: final_list,
            page
          });
          that.setData({ loading: false });
          resolve(res);
        }
      })
    });
  },
  up: function(e) {
    console.log("e", e);
    const that = this;
    // 产品ID
    const { product_id } = e.currentTarget.dataset;
    // 如果已经赞过则终止
    const { myups } = this.data;
    console.log(product_id);
    if(myups.indexOf(parseInt(product_id)) > -1)
    {
      wx.showToast({
        title: '您已赞过',
      });
      return false; 
    }
    // 用户openid
    const openid = wx.getStorageSync('openid');
    // 提交评论
    wx.request({
      url: config.host + '/product_up/add',
      method: "POST",
      data: { openid, product_id },
      success: function (res) {
        console.log("product_up add result: ", res);
        const { productList } = that.data;

        // 相应产品赞数增加
        const newProductList = productList.map(product => {
          if(product.id === product_id){
            return Object.assign(product, { up: product.up + 1 });
          }else{
            return product;
          }
        });
        that.setData({ productList: newProductList });
        // 添加到已赞
        that.data.myups.push(product_id);
        wx.showToast({
          title: '点赞成功',
        })
      }
    });
  },
  onShareAppMessage(options){
    console.log(options);
  },
  clickProduct: function(e) {
    console.log("e", e);
    const { product_id } = e.currentTarget.dataset;
    const { productList } = this.data;
    const { retail_price } = productList[0];

    if (retail_price == 0.02)
    {
      return false;
    }
    wx.navigateTo({
      url: '../detail/detail?product_id=' + product_id
    })
  },
  userInfoHandler: (a, b, c) => {
    console.log(a,b,c);
  },
  // 滚动条触底（无效）
  down: function () {
    const that = this;
    console.log("down");
    this.loadData(this.data.page + 1);
  },
  // 正在滚动
  scroll: function () {
    console.log("scroll");
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    console.log("onPullDownRefresh");

    this.data.page = 0;
    this.data.productList = [];
    const loadResult = this.loadData(this.data.page + 1);
    // 下拉恢复
    loadResult.then(res => {console.log("load result");wx.stopPullDownRefresh();});
  },
  // 上拉触底
  onReachBottom: function() {
    console.log("onReachBottom");
    const loadResult = this.loadData(this.data.page + 1);
  }
})
