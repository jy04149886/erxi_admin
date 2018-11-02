//index.js
//获取应用实例
const app = getApp()
var userid;
try {
  userid = wx.getStorageSync('userid')
} catch (e) {
  // Do something when catch error
}

Page({
  data: {
    device_text:''
  },
  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true
    })

    var _that = this

    this.getDeviceList(userid, _that)
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  getDeviceList: function (uid, target) {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getDeviceList',
      method: 'POST',
      data: {
        uid: uid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var devicelist = res.data.data
        if(devicelist.length>0){
          target.setData({
            devicelist: devicelist
          })
        } else {
          wx.redirectTo({
            url: '/pages/no_device/index?id=' + d_id
          })
        }
        
      }
    })
  },

  listenCharg: function (e) {
    var d_id = e.target.dataset.id
    wx.navigateTo({
      url: '/pages/service_pay_detail/index?id=' + d_id
    })
  }
})
