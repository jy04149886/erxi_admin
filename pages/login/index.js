const app = getApp()
var imageSize = app.globalData.imageSize
var sessionKey = "";
var userinfo = undefined

Page(Object.assign({
  data: {
    tu: "/pages/images/tu" + imageSize + ".png",
    page_enable: true
  },

  onLoad: function(options) {
    // var _that = this
    // var login_code = ""
    // var type = options.type
  },

  closePopup: function() {

    this.setData({
      showPopup: false
    });
  },

  weixindl: function(res) {
    userinfo = userinfo ? userinfo : res.detail.userInfo;
    if (!this.data.page_enable) {
      return false
    }
    var _that = this
    this.data.page_enable = false
    wx.showLoading({
      title: '加载中',
    })
    var _that = this
    wx.login({
      success: function(res) {
        wx.request({
          url: 'https://www.ju2xi.com/user/login/doLogin',
          method: 'POST',
          data: {
            reg_type: 1,
            code: res.code
          },
          success(res) {
            wx.hideLoading()
            if (res.data.status) {
              var user = res.data.data
              var userid = user.id
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
              wx.setStorageSync("openid", user.openid)
              wx.setStorageSync("user_token", user.token)
              wx.setStorageSync("user_info", user)
              wx.setStorageSync("userid", user.id)
              wx.setStorage({
                key: "login_type",
                data: "wx"
              })
              if (user.mobile == "" || !user.mobile) {
                wx.navigateTo({
                  url: '/pages/bind_mobile/index'
                })
              } else if (user.user_pass == "" || !user.user_pass) {
                wx.navigateTo({
                  url: '/pages/edit_password/index'
                })
              } else {
                wx.showToast({
                  title: "登陆成功",
                  icon: 'none',
                  duration: 2000
                })
                setTimeout(function() {
                  wx.request({
                    url: 'https://www.ju2xi.com/user/profile/getuserdevicelist',
                    data: {
                      userid: userid
                    },
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success: function(res) {
                      var device_last = res.data.device_last
                      if (!device_last) {
                        wx.showToast({
                          title: '请选择当前设备',
                          icon: 'success',
                          duration: 2000
                        })
                        wx.redirectTo({
                          url: '/pages/usercenter/index'
                        })
                        return false
                      } else {
                        wx.redirectTo({
                          url: '/pages/home/index'
                        })
                        return false
                      }
                    }
                  })
                  return false
                }, 2000);
              }
            } else {
              var openid = res.data.data.openid
              var unionid = res.data.data.unionid
              _that.registUser(openid, userinfo, unionid);
            }
            _that.data.page_enable = true
          }
        })
      }
    })
  },

  registUser(openid, userInfo, unionid) {
    var _that = this
    var nickName = userInfo.nickName
    var avatarUrl = userInfo.avatarUrl
    var gender = userInfo.gender //性别 0：未知、1：男、2：女
    var province = userInfo.province
    var city = userInfo.city
    var country = userInfo.country


    //注册
    wx.request({
      url: 'https://www.ju2xi.com/user/register/doRegister', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        reg_type: 1,
        nickName: nickName,
        avatarUrl: avatarUrl,
        gender: gender,
        province: province,
        city: city,
        country: country,
        openid: openid,
        unionid: unionid

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        _that.weixindl()
      }
    })
  },

  mimalogin: function() {
    var _that = this
    var username = this.data.phone;
    var password = this.data.password;
    if (!username) {
      wx.showToast({
        title: "手机号不能为空",
        icon: 'none',
        duration: 2000
      })
      return false
    }
    if (!password) {
      wx.showToast({
        title: "密码不能为空",
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.login({
      success: function (res) {
        wx.showLoading({
          title: '加载中',
        })
        wx.request({
          url: 'https://www.ju2xi.com/user/login/doLogin',
          method: 'POST',
          data: {
            username: username,
            password: password,
            reg_type: 2,
            code: res.code
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            wx.hideLoading()
            if (res.data.status) {
              wx.setStorage({
                key: "login_type",
                data: "mm"
              })
              var user = res.data.data;
              var userid = user.id
              wx.setStorageSync("user_token", user.token)
              wx.setStorageSync("user_info", user)
              wx.setStorageSync("openid", user.openid)
              wx.setStorageSync("userid", user.id)
              wx.showToast({
                title: "登陆成功",
                icon: 'none',
                duration: 2000
              })
              var user = res.data.data
              if (!user.user_pass) {
                wx.navigateTo({
                  url: '/pages/edit_password/index'
                })
                return false
              }
              wx.request({
                url: 'https://www.ju2xi.com/user/profile/getuserdevicelist',
                data: {
                  userid: userid
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  var device_last = res.data.device_last
                  if (!device_last) {
                    wx.showToast({
                      title: '请选择当前设备',
                      icon: 'success',
                      duration: 2000
                    })
                    wx.redirectTo({
                      url: '/pages/usercenter/index'
                    })
                    return false
                  } else {
                    wx.redirectTo({
                      url: '/pages/home/index'
                    })
                    return false
                  }
                }
              })
              return false
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    })
    
  },

  listenerPhoneInput: function(e) {
    this.data.phone = e.detail.value;

  },

  listenerPasswordInput: function(e) {
    this.data.password = e.detail.value;
  },




}));