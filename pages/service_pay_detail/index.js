//index.js
//获取应用实例
const app = getApp()
var device_id = undefined
var openid = undefined
var userid = undefined

Page({
  data: {
  },
  onLoad: function (option) {
    device_id = option.id
    openid = wx.getStorageSync('openid')
    userid = wx.getStorageSync('userid')
    var _that = this
    // 在没有 open-type=getUserInfo 版本的兼容处理
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })

    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getItemList',
      method: 'POST',
      data: {
        type: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var gpslist = res.data.data
        _that.setData({
          gpslist: gpslist
        })
      }
    })

    // wx.request({
    //   url: 'https://www.ju2xi.com/user/profile/getItemList',
    //   method: 'POST',
    //   data: {
    //     type: 2
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function (res) {
    //     var textlist = res.data.data
    //     _that.setData({
    //       textlist: textlist
    //     })
    //   }
    // })

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
        _that.setData({
          device_detail: res.data
        })
      }
    })

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  startpay: function (e) {
    var price = e.currentTarget.dataset.price
    var item_id = e.currentTarget.dataset.itemid
    wx.request({
      url: 'https://www.ju2xi.com/user/weixin/getWxPrepay',
      data: {
        total_fee: price,
        openid: openid,
        uid: userid,
        device_id: device_id,
        item_id: item_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var data = res.data
        if (!data.msg) {
          var package1 = data.package
          var noncestr = data.nonceStr
          var timestamp = data.timeStamp
          var sign = data.sign
          var order_id = data.order_id
          wx.requestPayment({
            'timeStamp': timestamp.toString(),
            'nonceStr': noncestr,
            'package': package1,
            'signType': 'MD5',
            'paySign': sign,
            'success': function (res) {
              wx.request({
                url: 'https://www.ju2xi.com/user/weixin/handleOrderAfterPay',
                data: {
                  order_id: order_id,
                  status: 1,
                  uid: userid,
                  total_fee: price
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                  })
                }
              })

            },
            'fail': function (res) {
              console.log(res.errMsg)
              wx.request({
                url: 'https://www.ju2xi.com/user/weixin/handleOrderAfterPay',
                data: {
                  order_id: order_id,
                  uid: userid,
                  status: 0,
                  total_fee: price
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                }
              })
              wx.showToast({
                title: '交易取消',
                icon: 'none',
                duration: 2000
              })
            }
          })

        } else {
          wx.showToast({
            title: data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
})
