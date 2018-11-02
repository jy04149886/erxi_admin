//index.js
//获取应用实例
const app = getApp()
var userid;

Page({
  data: {
    showPopup:false
  },
  onLoad: function () {
    try {
      userid = wx.getStorageSync('userid')
    } catch (e) {
      // Do something when catch error
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  listenpassword:function(e){
    this.data.password = e.detail.value
  },

  submiteditpass:function(e){
    var _that = this
    var password = this.data.password
    if(!password){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return false
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/passwordPost',
      method: 'POST',
      data: {
        userid: userid,
        password: password
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        if (res.data.status) {
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/home/index'
            })
          }, 2000);
          // wx.navigateBack({
          //   delta: 1
          // })
        }
      }
    })
  },

  closePopup: function () {

    this.setData({
      showPopup: false
    });
  },
})
