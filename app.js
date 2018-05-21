//app.js
App({
  onLaunch: function () {
    const shareInfo = wx.getShareInfo();
    console.log("shareInfo", shareInfo);
    const that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        that.globalData.code = res.code;
      }
    })
  },
  globalData: {
    userInfo: null
  }
})