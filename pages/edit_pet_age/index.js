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
    this.data.age = e.detail.value
  },

  isInteger:function (obj) {
    return obj% 1 === 0
  },

  listensubmit: function () {
    var age = this.data.age
    if (!this.isInteger(age)) {
      wx.showToast({
        title: '必须为整数',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if (age.trim().length<1){
      wx.showToast({
        title: '不能为空年纪',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/updatepetinfo',
      data: {
        age: age,
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
        if(res.data.status){
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
