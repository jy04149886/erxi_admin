//index.js
//获取应用实例
const app = getApp()
var userid = wx.getStorageSync('userid');
var isopenidtext = "已绑定"
var isbindopenid = true
var ismobiletext = ''
var isbindmobile = true
var imageSize = app.globalData.imageSize
var login_type = undefined;
var userinfo = app.globalData.userInfo
var user_token = undefined
var is_page_init =0 

Page({
  data: {
    head_mine: '/pages/images/head_mine' + imageSize + '.png',
    Path: '/pages/images/Path' + imageSize + '.png',
  },
  onLoad: function () {
    var _that = this
    user_token = wx.getStorageSync('user_token')
    login_type = wx.getStorageSync('login_type')
    wx.getStorage({
      key: 'userid',
      success: function (res) {
        userid = res.data
        if (!userid) {
          wx.redirectTo({
            url: '/pages/login/index'
          })
          return false
        }
        wx.request({
          url: 'https://www.ju2xi.com/user/profile/getUserinfo',
          data: {
            user_token: user_token
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            userinfo = res.data.data
            if (!userinfo.openid) {
              isopenidtext = "未绑定"
              isbindopenid = false
            }
            if (!userinfo.mobile) {
              ismobiletext = "未绑定"
              isbindmobile = false
            } else {
              ismobiletext = userinfo.mobile
              isbindmobile = true
            }
            _that.setData({
              isopenidtext: isopenidtext,
              userInfo: userinfo,
              login_type: login_type,
              ismobiletext: ismobiletext,
              isbindmobile: isbindmobile
            })
          }
        })
      }
    })

    
    // login_type = login_type=='wx'?true:false
    // 在没有 open-type=getUserInfo 版本的兼容处理
  },

  onShow: function (e) {
    if (is_page_init > 0) {
      this.onLoad()
    } else {
      is_page_init++
    }
  },
  listenbindweixin: function () {
    var _that = this
    if (isbindopenid) {
      // this.unbindweixin();
    } else {
      wx.login({
        success: function (res) {
          console.log(res)
          if (res.code) {
            _that.bindweixin(res.code)
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        },
        fail: function (res) {
          console.log(res)
        }
      });
    }
  },

  listenbindmibile: function (e) {
    wx.navigateTo({
      url: '/pages/bind_mobile/index'
    })
  },

  bindweixin: function (code) {
    var _that = this
    wx.showModal({
      title: '提示',
      content: '绑定微信号',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://www.ju2xi.com/user/profile/bindWeixin',
            method: 'POST',
            data: {
              uid: userid,
              code: code
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              var openid = res.data.openid
              if (res.data.status) {
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (res) {

                    var userInfo = res.userInfo
                    var nickName = userInfo.nickName
                    var avatarUrl = userInfo.avatarUrl
                    var gender = userInfo.gender //性别 0：未知、1：男、2：女
                    var province = userInfo.province
                    var city = userInfo.city
                    var country = userInfo.country

                    // var encryptedData = res.encryptedData
                    // var appId = 'wx9f257ac6c3a110d0'
                    // var iv = res.iv

                    wx.login({
                      success: function (res) {
                        if (res.code) {
                          code = res.code

                          wx.request({
                            url: 'https://www.ju2xi.com/user/weixin/getsessionkey',
                            data: {
                              code: code,
                            },
                            method: 'post',
                            header: {
                              'content-type': 'application/json' // 默认值
                            },
                            success: function (res) {
                              console.log(res   )
                              if (res.data.errcode){
                                console.log(res.data.errmsg)
                              }else{
                                var unionid = res.data.unionid
                                //注册
                                wx.request({
                                  url: 'https://www.ju2xi.com/user/register/updatewxinfo', //仅为示例，并非真实的接口地址
                                  method: 'POST',
                                  data: {
                                    nickName: nickName,
                                    avatarUrl: avatarUrl,
                                    gender: gender,
                                    province: province,
                                    city: city,
                                    country: country,
                                    openid: openid,
                                    userid: userid,
                                    unionid: unionid
                                  },
                                  header: {
                                    'content-type': 'application/json' // 默认值
                                  },
                                  success: function (res) {
                                    isbindopenid = true
                                    isopenidtext = '已绑定'
                                    _that.setData({
                                      isbindopenid: isbindopenid,
                                      isopenidtext: isopenidtext
                                    })
                                    wx.setStorage({
                                      key: "openid",
                                      data: openid
                                    })
                                    wx.navigateTo({
                                      url: '/pages/usercenter/index'
                                    })
                                  }
                                })
                              }
                            }
                          })



                        } else {
                          console.log('登录失败！' + res.errMsg)
                        }
                      }
                    });



                    
                  }
                })
              }
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
        }
      }
    })

  },


  unbindweixin: function (code) {
    var _that = this
    wx.showModal({
      title: '提示',
      content: '解除绑定微信号',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://www.ju2xi.com/user/profile/unbindWeixin',
            method: 'POST',
            data: {
              uid: userid
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              if (res.data.status) {
                isbindopenid = false
                isopenidtext = '未绑定'
                _that.setData({
                  isbindopenid: isbindopenid,
                  isopenidtext: isopenidtext
                })
                wx.removeStorage({
                  key: 'openid',
                  success: function (res) {
                  }
                })
              }

              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
        }
      }
    })
  },

  logout: function () {
    wx.showModal({
      title: '提示',
      content: '确定退出登录',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.removeStorageSync('userid')
            wx.removeStorageSync('user_token')
            wx.removeStorageSync('openid')
            wx.removeStorageSync('user_info')
            wx.clearStorage()
          } catch (e) {
            // Do something when catch error
          }
          app.globalData.userInfo = null
          wx.redirectTo({
            url: '/pages/login/index'
          })
        } else if (res.cancel) {
        }
      }
    })

  }
})
