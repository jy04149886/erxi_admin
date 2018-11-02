//index.js
//获取应用实例
const app = getApp()
var device_id = undefined
var userid;

Page({
  data: {
    sexarray: ['雌性', '雄性'],
    objectSexarray: [
      {
        id: 1,
        name: '雌性'
      },
      {
        id: 2,
        name: '雄性'
      }
    ],
    sexindex: 0,
    selectsex: '请选择'
  },
  onLoad: function (option) {
    device_id = option.device_id
    userid = wx.getStorageSync('userid')
  },
  listendevicename: function (e) {
    this.data.sex = e.detail.value
    console.log(this.data.sex)
    this.setData({
      sexindex: e.detail.value,
      selectsex: this.data.sexarray[e.detail.value]
    })
  },

  listensubmit: function () {
    var sex = this.data.sex
    if (!sex) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/updatepetinfo',
      data: {
        sex: sex,
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
        if (res.data.status) {
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
