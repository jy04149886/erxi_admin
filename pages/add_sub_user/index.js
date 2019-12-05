const app = getApp()
var imageSize = app.globalData.imageSize
var userid = undefined
var imei = undefined

Page(Object.assign({
  data: {
    bound: '/pages/images/bound' + imageSize + '.png',
    mine_add: '/pages/images/mine_add' + imageSize + '.png',
    jiechujianhuren: '/pages/images/jiechujianhuren' + imageSize + '.png',
  },
  onLoad: function (option) {
    console.log(option)
    userid = option.userid
    imei = option.imei
    this.getDeviceList(userid, imei)
  },

  scanercode: function () {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/bindDevice',
      method: 'POST',
      data: {
        uid: userid,
        imei: imei
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.status) {
          setTimeout(function () {
            // wx.redirectTo({
            //   url: '/pages/home/index'
            // })
            wx.navigateBack({
              delta: 1
            })
          }, 2000);
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },

  inputmobile: function (e) {
    this.data.mobile = e.detail.value
  },

  bindDevice: function () {
    var _that = this
    if (!this.data.mobile) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 3000
      })
      return null;
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/bindSubuser',
      method: 'POST',
      data: {
        uid: userid,
        imei: imei,
        mobile: this.data.mobile
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.status) {
          // setTimeout(function () {
          //   wx.redirectTo({
          //     url: '/pages/home/index'
          //   })
          //   // wx.navigateBack({
          //   //   delta: 1
          //   // })
          // }, 2000);

          _that.getDeviceList(userid, imei)
          _that.setData({
            mobile: null
          })
        }
        wx.showToast({
          title: '添加账号成功，在新添加号中扫码绑定该设备即可！',
          icon: 'none'
        })
      }
    })
  },

  getDeviceList: function (uid, imei) {
    var _that = this
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getSubuserList',
      method: 'POST',
      data: {
        uid: uid,
        imei: imei,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var devicelist = res.data.data
        console.log(devicelist)
        _that.setData({
          devicelist: devicelist
        })
      }
    })
  },

  unbindSubuser: function (e) {
    var _that = this
    wx.showModal({
      title: '提示',
      content: '确定要解除这个用户吗？',
      success(res) {
        if (res.confirm){
          var id = e.currentTarget.dataset.item.id
          var uid = e.currentTarget.dataset.item.uid
          wx.request({
            url: 'https://www.ju2xi.com/user/profile/unbindSubuser',
            method: 'POST',
            data: {
              id: id,
              uid: uid,
              imei: imei
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              _that.getDeviceList(userid, imei)
              _that.setData({
                mobile: null
              })
            }
          })
        }
      }
    })


  },
}));
