//index.js
//获取应用实例
const app = getApp()
var imageSize = app.globalData.imageSize
var device_id = undefined
var userid = undefined
var is_page_init=0

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    Path: '/pages/images/Path' + imageSize + '.png',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    var _that = this
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'https://www.ju2xi.com/user/profile/uploadDeviceAvatar',
          filePath: tempFilePaths[0],
          name: 'avatar',
          formData: {
            'device_id': device_id
          },
          success: function (res) {
            var data = JSON.parse(res.data)
            if (data.status) {
              _that.setData({
                avatar: data.path,
              })
            }
            wx.showToast({
              title: data.msg,
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })
  },
  onLoad: function (option) {
    userid = wx.getStorageSync('userid')
    device_id = option.device_id
    var _that = this
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
        var text_number = res.data.text_number
        if (!res.data.avatar) {
          avatar_1 = '/pages/images/head_mine' + imageSize + '.png'
        }
        var avatar_1 = res.data.avatar
        _that.setData({
          device_name: res.data.device_name,
          avatar: avatar_1,
        })
      }
    })
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getpetlist',
      method: 'POST',
      data: {
        device_id: device_id,
        userid: userid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.pet_list) {
          _that.setData({
            age: res.data.pet_list.age ? res.data.pet_list.age : '',
            sex: res.data.pet_list.sex==1 ? '雄' : '雌',
            varieties: res.data.pet_list.varieties ? res.data.pet_list.varieties : '',
          })
        }
      }
    })
  },

  onShow:function(){
    if (is_page_init > 0) {
      this.onLoad({ device_id: device_id})
    }else{
      is_page_init++
    }
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  gotoeditnickname: function () {
    wx.navigateTo({
      url: '/pages/edit_device_name/index?device_id=' + device_id
    })
  },

  gotoeditpetage: function () {
    wx.navigateTo({
      url: '/pages/edit_pet_age/index?device_id=' + device_id
    })
  },

  gotoeditpetvarieties: function () {
    wx.navigateTo({
      url: '/pages/edit_pet_varieties/index?device_id=' + device_id
    })
  },

  gotoeditpetsex: function () {
    wx.navigateTo({
      url: '/pages/edit_pet_sex/index?device_id=' + device_id
    })
  },
})
