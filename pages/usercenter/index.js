//index.js
//获取应用实例
const app = getApp();
var userid;
var user_token = wx.getStorageSync('user_token');
var imageSize = app.globalData.imageSize;
var is_page_init = 0
Page({
  data: {
    mine_add: '/pages/images/mine_add' + imageSize + '.png',
    mine_rs: '/pages/images/mine_rs' + imageSize + '.png',
    Path: '/pages/images/Path' + imageSize + '.png',
    mine_news: '/pages/images/mine_news' + imageSize + '.png',
    mine_que: '/pages/images/mine_que' + imageSize + '.png',
    mine_call: '/pages/images/mine_call' + imageSize + '.png',
    mine_que: '/pages/images/mine_que' + imageSize + '.png',
    mine_bg: '/pages/images/device_bg' + imageSize + '.png',
    more_bg_nol: '/pages/images/device_bg_nol' + imageSize + '.png',
    head_mine: '/pages/images/head_mine' + imageSize + '.png',
    is_sub_bg: 'background-image:url(' + 'http://www.ju2xi.com/wx/images/jianhuren_bg' + imageSize + '.png)',
    is_sub_bg_nosel: 'background-image:url(' + 'http://www.ju2xi.com/wx/images/jianhuren_bg_unsel' + imageSize + '.png)',
    main_bg: 'background-image:url(' + 'http://www.ju2xi.com/wx/images/device_bg' + imageSize + '.png)',
    main_bg_nosel: 'background-image:url(' + 'http://www.ju2xi.com/wx/images/device_bg_nol' + imageSize + '.png)',
  },
  onLoad: function () {
    var _that = this
    wx.getStorage({
      key: 'userid',
      complete: function (res) {
        userid = res.data
        if (!userid) {
          wx.redirectTo({
            url: '/pages/login/index'
          })
          return false
        }
        _that.getDeviceList(userid, _that)
        wx.request({
          url: 'https://www.ju2xi.com/user/profile/getUserinfo',
          data: {
            userid: userid,
            user_token: user_token
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            _that.setData({
              userInfo: res.data.data,
              hasUserInfo: true
            })
          }
        })
      }
    })
  },

  onShow: function (e) {
    if (is_page_init > 0) {
      this.onLoad()
    } else {
      is_page_init++
    }
  },
  // getUserInfo: function (e) {
  //   console.log(e)
  //   app.globalData.userInfo = e.detail.userInfo
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // },
  listenItemDetail: function (e) {
    if (e.currentTarget.dataset.sub > 0) {
      var url = "/pages/item_detail_sub/index?d_id=" + e.target.dataset.id
    } else {
      var url = "/pages/item_detail/index?d_id=" + e.target.dataset.id
    }
    wx.navigateTo({
      url: url
    })
  },
  listenerSetCurrentDevice: function (e) {
    var id = e.detail.value
    this.changecurrentdevice(id)
    // wx.navigateTo({
    //   url: 'https://www.ju2xi.com/wx/home/index'
    // })
  },
  changecurrentdevice: function (id) {
    var _that = this
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCurrentDevice',
      method: 'POST',
      data: {
        uid: userid,
        device_id: id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        _that.getDeviceList(userid, _that)
      }
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
        target.setData({
          devicelist: devicelist
        })
      }
    })
  },
  listenEdituserinfo: function () {
    wx.navigateTo({
      url: '/pages/account_edit/index'
    })
  },

  listengotohome: function (e) {
    var id = e.currentTarget.dataset.id
    this.changecurrentdevice(id)
    wx.redirectTo({
      url: '/pages/home/index'
    })
  },

  listengobackbtn: function (e) {
    // wx.navigateBack({
    //   delta: 1
    // })
    if (this.data.devicelist.length == 0) {
      wx.showToast({
        title: "请添加设备",
        icon: 'none'
      })
      return false
    }
    wx.redirectTo({
      url: '/pages/home/index'
    })
  },

  listenadddevice: function (e) {
    wx.navigateTo({
      url: '/pages/bind_device/index'
    })
  },

  listenpayservice: function (e) {
    wx.navigateTo({
      url: '/pages/service_pay/index'
    })
  },

  listenmessage: function (e) {
    wx.navigateTo({
      url: '/pages/message_list/index'
    })
  },

  listenproblem: function (e) {
    wx.navigateTo({
      url: '/pages/problem/index'
    })
  },

  listencontract: function (e) {
    wx.navigateTo({
      url: '/pages/contract/index'
    })
  },
})