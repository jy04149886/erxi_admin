//index.js
//获取应用实例
const app = getApp()
var device_id = undefined
var userid = undefined

Page({
  data: {
  },
  onLoad: function (option) {
    device_id = option.device_id
    userid = wx.getStorageSync('userid')
  },
  listendevicename: function (e) {
    this.data.name = e.detail.value
  },

  listensubmit: function () {
    var name = this.data.name
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/changeDeviceName',
      data: {
        name: name,
        device_id: device_id,
        userid: userid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 2000
        })
        if (res.data.status){
          setTimeout(function () {
            // wx.redirectTo({
            //   url: '/pages/usercenter/index'
            // })
            wx.navigateBack({
              delta: 1
            })
          }, 2000);
        }
      }
    })
  }

})
