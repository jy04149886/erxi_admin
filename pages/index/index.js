//index.js
//获取应用实例
const app = getApp()
var user_token = undefined
var openid = undefined
var userid = undefined

Page({
  data: {
  },
  onLoad: function () {
    var _that = this
    try {
      user_token = wx.getStorageSync('user_token')
      openid = wx.getStorageSync('openid')
      userid = wx.getStorageSync('userid')
    } catch (e) {
      // Do something when catch error
    }
    if (!userid) {
      // this.getuserid(user_token, openid)
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return false
    }
    // if (user_token && !openid) {
    //   wx.redirectTo({
    //     url: '/pages/usercenter/index'
    //   })
    //   return false;
    // } else 
    if (openid && !user_token) {
      // 登录
      wx.login({
        success: res => {
          var code = res.code
          wx.request({
            url: 'https://www.ju2xi.com/user/profile/getOpenidByCode',
            data: {
              code: code,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              var current_openid = res.data.data
              if (current_openid == openid) {
                // 获取用户信息
                wx.redirectTo({
                  url: '/pages/bind_mobile/index'
                })
                return false
                wx.getSetting({
                  success: res => {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                      success: res => {
                        console.log(res.userInfo)
                        // 可以将 res 发送给后台解码出 unionId
                        _that.globalData.userInfo = res.userInfo
                        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                        // 所以此处加入 callback 以防止这种情况
                        if (_that.userInfoReadyCallback) {
                          _that.userInfoReadyCallback(res)
                        }
                        wx.redirectTo({
                          url: '/pages/bind_mobile/index'
                        })
                        return false
                      }
                    })
                  }
                })
              } else {
                wx.redirectTo({
                  url: '/pages/login/index'
                })
                return false
              }
            }
          })
        }
      })
    } else if (!openid && !user_token) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return false
    } else {
      wx.redirectTo({
        url: '/pages/home/index'
      })
      return
    }
  },

  userInfoReadyCallback: function (res) {
    this.globalData.userInfo = {
      userInfo: res.userInfo,
      hasUserInfo: true
    }
  }, getuserid: function (token, openid) {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getUserid',
      data: {
        openid: openid,
        token: token
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.status) {
          var userid = res.data.data
          wx.setStorage({
            key: "userid",
            data: userid
          })
        } else {
          wx.redirectTo({
            url: '/pages/login/index'
          })
          return false
        }
      }
    })
  },
})
