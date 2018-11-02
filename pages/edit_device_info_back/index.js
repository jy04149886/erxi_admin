//index.js
//获取应用实例
const app = getApp()
let uid = undefined
let device_id = undefined

Page({
  data: {
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
    var _that = this
    device_id = options.device_id
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getDeviceDetailInfo',
      method: 'POST',
      data: {
        device_id: device_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        _that.setData({
          contract: res.data.contract,
          contract_phone: res.data.contract_phone,
          device_phone: res.data.device_phone,
          device_name: res.data.device_name,
        })
      }
    })
    
    var user_info = undefined
    try {
      var user_info = wx.getStorageSync('user_info')
      uid = user_info.id
      console.log("device_id:" + device_id)
      if (user_info) {
        // Do something with return value
      }
    } catch (e) {
      // Do something when catch error
      console.log("获取本地缓存的用户信息失败")
    }

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  listenerContract: function (e) {
    this.setData({
      contract: e.detail.value
    })
  },

  listenerContractPhone: function (e) {
    this.setData({
      contract_phone: e.detail.value
    })
  },

  listenerDevicePhone: function (e) {
    this.setData({
      device_phone: e.detail.value
    })
  },

  listenerDeviceName: function (e) {
    this.setData({
      device_name: e.detail.value
    })
  },


  closePopup: function () {

    this.setData({
      showPopup: false
    });
    //登陆成功跳转页面

  },

  submit_info: function () {
    var _that = this
    var contract = this.data.contract
    var contract_phone = this.data.contract_phone
    var device_phone = this.data.device_phone
    var device_name = this.data.device_name
    if (!contract || !contract_phone || !device_phone || !device_name) {
      wx.showToast({
        title: '设备信息不能为空',
        icon: 'none'
      })
      return false;
    }

    wx.request({
      url: 'https://www.ju2xi.com/user/profile/editDeviceInfo',
      method: 'POST',
      data: {
        device_id: device_id,
        uid: uid,
        contract: contract,
        contract_phone: contract_phone,
        device_phone: device_phone,
        device_name: device_name,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })

  }

})
