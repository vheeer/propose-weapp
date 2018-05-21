//获取应用实例
const app = getApp();
const config = require('../../config.js');
function getDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  return s
};
Page({
  data: {
    value: "",
    userInfo: {},
    hasUserInfo: false,
    product: {},
    bannars: [
      "https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/4bbba384040ba2cb8932917fa47ee051.jpg"
    ],
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
      color: "#FF0000DD",
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
    }]
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
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    const that = this;
    const { share_openid, product_id } = options;
    // 设置转发
    const shareInfo = wx.getShareInfo();
    console.log("shareInfo", shareInfo);
    // 本页产品ID
    this.data.product_id = options.product_id;
    // 加载第一页数据
    this.loadData(this.data.product_id);
    // 设置转发
    wx.showShareMenu({
      withShareTicket: true
    });
    if (share_openid && product_id )
    {
      wx.request({
        url: config.host + "/share/fromadd",
        method: "POST",
        data: {
          openid: share_openid,
          product_id
        },
        success: res => {
          console.log("res: ", res);
        }
      })
    }
  },
  onShow: function () {

  },
  // 加载主页信息

  // 主页信息
  loadData(product_id) {
    const that = this;
    // 产品详情
    wx.request({
      url: config.host + '/product/index?product_id=' + product_id,
      method: "GET",
      success: function (res) {
        const { product } = res.data.data;
        that.setData({
          ...res.data.data
        });
        const target_latitude = parseInt(product.target_position.split('_')[1]) / (1000 * 1000);
        const target_longitude = parseInt(product.target_position.split('_')[2]) / (1000 * 1000);
        const my_latitude = parseInt(product.my_position.split('_')[1]) / (1000 * 1000);
        const my_longitude = parseInt(product.my_position.split('_')[2]) / (1000 * 1000);
        that.setData({
          latitude: target_latitude,
          longitude: target_longitude,
          my_latitude,
          my_longitude
        });
        const line = {
          polyline: [{
            points: [],
            color: "#FF0000DD",
            width: 2,
            dottedLine: true
          }]
        };
        // 地图上的标记点
        const markers = [{
          iconPath: "https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/%E5%A4%87%E7%94%A8.jpg",
          id: 0,
          latitude: target_latitude,
          longitude: target_longitude,
          width: 50,
          height: 50
        }, {
          iconPath: "https://propose-1255763133.cos.ap-beijing.myqcloud.com/%E6%A8%A1%E5%9D%97/%E5%A4%87%E7%94%A8.jpg",
          id: 0,
          latitude: my_latitude,
          longitude: my_longitude,
          width: 50,
          height: 50
        }];
        line.polyline[0].points.push({
          longitude: my_longitude,
          latitude: my_latitude
        });
        line.polyline[0].points.push({
          longitude: target_longitude,
          latitude: target_latitude
        });
        // 计算距离
        const distance = getDistance(my_latitude, my_longitude, target_latitude, target_longitude);
        that.setData({
          polyline: line.polyline,
          markers,
          includePoints: markers,
          distance
        });
        console.log("line.polyline", line.polyline);
        console.log("this.data.polyline", that.data.polyline);
        console.log("target_latitude", target_latitude);
        console.log("target_longitude", target_longitude);
        console.log("my_latitude", my_latitude);
        console.log("my_longitude", my_longitude);
      }
    });
  },
  onShareAppMessage(options) {
    const that = this;
    const { prima_pic_url } = this.data.goods[0];
    const { id, my_name, target } = this.data.product;
    const openid = wx.getStorageSync("openid");
    console.log(options);
    
    return {
      title: my_name + "牵手" + target + ",快来点赞吧！",
      imageUrl: prima_pic_url,
      path: '/pages/detail/detail?share_openid=' + openid + "&product_id=" + id,
      success: function (res) {
        console.log("info res:", res);
        if (!res.shareTickets) {
          wx.request({
            url: config.host + "/share/add",
            method: "POST",
            data: {
              openid,
              product_id: id
            },
            success: res => {
              console.log("res: ", res);
              const { openGId } = res.data.data;
              that.setData({
                openGId
              });
            }
          })
          return false;
        }
        const  shareTicket = res.shareTickets[0];
        
        wx.getShareInfo({
          shareTicket,
          success: res => {
            console.log("info res:", res);
            const { encryptedData, iv } = res;
            wx.request({
              url: config.host + "/share/add",
              method: "POST",
              data: {
                openid,
                encryptedData,
                iv,
                product_id: id
              },
              success: res => {
                console.log("res: ", res);
                const { openGId } = res.data.data;
                that.setData({
                  openGId
                });
              }
            })
          }
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
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
  post: function() {
    console.log("post");
  },
  back: function() {
    wx.switchTab({
      url: '../index/index',
      success: res => console.log(res),
      fail: res => console.log(res),
      complete: res => console.log(res),
    })
  },
  up: function() {
    const that = this;
    // 产品ID
    const { id: product_id } = this.data.product;
    // 用户openid
    const openid = wx.getStorageSync('openid');
    // 提交评论
    wx.request({
      url: config.host + '/product_up/add',
      method: "POST",
      data: { openid, product_id },
      success: function (res) {
        console.log("product_up add result: ", res);
        that.data.product_up = [];
        that.loadData(that.data.product_id);
        wx.showToast({
          title: '点赞成功',
        })
      }
    });
  },
  formSubmit: function (e) {
    const { value } = e.detail;
    const that = this;
    // 如果空则不提交
    if(value.content === "")
    {
      wx.showToast({
        title: '请输入内容'
      });
      return false;
    }
    // 产品ID
    const { id: product_id } = this.data.product;
    // 用户openid
    const openid = wx.getStorageSync('openid');
    // 提交评论
    wx.request({
      url: config.host + '/product_comment/add',
      method: "POST",
      data: { ...value, openid, product_id },
      success: function (res) {
        console.log("product_comment add result: ", res);
        that.data.product_comment = [];
        that.loadData(that.data.product_id);
      }
    })
  },
  bindType: function(e) {
    console.log("e", e);
    const { value } = this.data;
    this.setData({
      value: ""
    });
  },
  
})
