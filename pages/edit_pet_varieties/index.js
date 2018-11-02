//index.js
//获取应用实例
const app = getApp()
var device_id = undefined
var userid;

Page({
  data: {
  },
  onLoad: function (option) {
    device_id = option.device_id
    userid = wx.getStorageSync('userid')
  },
  listendevicename: function (e) {
    this.data.varieties = e.detail.value
  },

  listensubmit: function () {
    var varieties = this.data.varieties
    if (!varieties) {
      wx.showToast({
        title: '请填写品种',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/updatepetinfo',
      data: {
        varieties: varieties,
        userid: userid,
        device_id: device_id
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 2000
        })

        setTimeout(function () {
          // wx.redirectTo({
          //   url: '/pages/usercenter/index'
          // })
          wx.navigateBack({
            delta: 1
          })
        }, 2000);
      }
    })
  }

})
