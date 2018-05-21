// pages/edit/edit.js
const app = getApp();
const config = require('../../config.js');
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
// TCCBZ - XUICJ - A6PFE - KL5IQ - PV4E6 - BXF6P
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGoods: {},
    my_position: "",
    my_latitude: 0,
    my_longitude: 0,
    target_position: "",
    target_latitude: 0,
    target_longitude: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const { goods_id } = options;
    const { goodsList } = app.globalData;
    // 提取此页面的商品属性
    let currentGoods = null;
    goodsList.forEach(goods => {
      if(goods.id === parseInt(goods_id))
        currentGoods = goods;
    });
    this.setData({currentGoods});

    // 自己位置初始化
    // 实例化腾讯地图API核心类
    const qqmapsdk = new QQMapWX({
      key: 'TCCBZ-XUICJ-A6PFE-KL5IQ-PV4E6-BXF6P' // 必填
    });
    console.log(qqmapsdk);
    // 查看位置
    wx.getLocation({
      type: 'wgs84', // 返回可以用于wx.openLocation的经纬度
      success: function (res) {
        console.log("getLocation res: ", res);
        // 根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        console.log(qqmapsdk.reverseGeocoder);
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (addressRes) {
            const address = addressRes.result.formatted_addresses.recommend;
            const { lat: latitude, lng: longitude } = addressRes.result.location;
            console.log(addressRes);
            that.setData({
              my_position: address,
              my_latitude: latitude,
              my_longitude: longitude
            })
          }
        })
      },
      _success: function (res) {
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  formSubmit: function (e) {
    const { value } = e.detail;
    const { content_max } = this.data.currentGoods;
    const alert = title => wx.showToast({
      title
    })
    // 验证表单值合法性
    console.log("value", value);
    if (!value.my_position || value.my_position === ""){
      alert("无法获取位置信息");
      return false;
    }
    if (!value.word || value.word === "") {
      alert("请输入宣言");
      return false;
    }
    if (value.word.length > 13) {
      alert("宣言在13字以内");
      return false;
    }
    if (!value.target_position || value.target_position === "") {
      alert("请输入对方位置");
      return false;
    } 
    if (!value.content || value.content === "") {
      alert("请输入表白内容");
      return false;
    }
    if (value.content.length > content_max) {
      alert("内容在" + content_max + "字以内");
      return false;
    }
    if (!value.target || value.target === "") {
      alert("请输入对方名字");
      return false;
    }
    if (!value.my_name || value.my_name === ""){  
      alert("请输入签名");
      return false;
    }
    // 生成位置信息
    const { my_position, target_position } = value;
    const { my_latitude, my_longitude, target_latitude, target_longitude } = this.data;
    value.my_position = my_position + "_" + my_latitude * 1000 * 1000 + "_" + my_longitude * 1000 * 1000;
    value.target_position = target_position + "_" + target_latitude * 1000 * 1000 + "_" + target_longitude * 1000 * 1000;
    this.upload(value);
  },
  // 提交信息
  upload(value){
    const that = this;
    // 商品ID
    const { id: goods_id } = this.data.currentGoods;
    // 用户openid
    const openid = wx.getStorageSync('openid');
    console.log({...value, goods_id, openid});
    wx.request({
      url: config.host + '/pay/prepay',
      method: "POST",
      data: { ...value, goods_id, openid },
      success: function (res) {
        console.log("prepay result: ", res);
        const { errno, errmsg } = res.data;
        if(errno === 1000 && errmsg ==="free")
        {
          console.log("requestPayment success res: ", res);
          app.globalData.refresh = 1;
          wx.switchTab({
            url: '../index/index',
          });
          return false;
        }
        const { appid, ...payParams } = res.data.data;
        wx.requestPayment({ 
          ...payParams, 
          success: res => {
            console.log("requestPayment success res: ", res);
            app.globalData.refresh = 1;
            wx.switchTab({
              url: '../index/index',
            })
          }
        });
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  // 我的位置
  choose_my_pos: function () {
    const that = this;
    // 选择位置
    wx.chooseLocation({
      success: (pos) => {
        console.log("pos", pos);
        let { longitude, latitude, address, name } = pos;
        if (typeof address === "undefined")
          address = "";
        if (typeof name === "undefined")
          name = "";
          that.setData({ 
            my_position: address,
            my_latitude: latitude,
            my_longitude: longitude
          });
      }
    })
  },
  // 目标位置
  choose_target_pos: function () {
    const that = this;
    // 选择位置
    wx.chooseLocation({
      success: (pos) => {
        console.log("pos", pos);
        let { longitude, latitude, address, name } = pos;
        if (typeof address === "undefined")
          address = "";
        if (typeof name === "undefined")
          name = "";
        that.setData({
          target_position: address,
          target_latitude: latitude,
          target_longitude: longitude
        });
      }
    })
  }
})