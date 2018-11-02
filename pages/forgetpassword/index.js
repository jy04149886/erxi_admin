// const Zan = require('../../zanui-weapp-dev/dist/index');
// const config = require('./config');
const app = getApp()
var imageSize = app.globalData.imageSize

Page(Object.assign({}, {
  data: {
    tu: '/pages/images/tu' + imageSize + '.png',
  },

  inputmobile:function(e){
    this.data.phone = e.detail.value
  },

  inputcheckcode: function (e) {
    this.data.checkcode = e.detail.value
  },

  inputpassword: function (e) {
    this.data.password = e.detail.value
  },


  submit: function (e) {
    var _that = this
    var username = this.data.phone;
    var password = this.data.password;
    var checkcode = this.data.checkcode;

    if (!username) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return false
    }

    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return false
    }
    if (!checkcode) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none'
      })
      return false
    }


    wx.request({
      url: 'https://www.ju2xi.com/user/login/passwordReset',
      method: 'POST',
      data: {
        mobile: username,
        password: password,
        verification_code: checkcode
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.status) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }, 2000);

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
    })
  },
  listenergetcheckcode: function (e) {
    var mobile = this.data.phone;
    var _that = this
    if (!mobile) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return false
    }

    wx.request({
      url: 'https://www.ju2xi.com/user/verificationcode/send_verify_code', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        mobile: mobile
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var status = res.data.status
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },

  checkmobile: function (mobile) {
    var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
    if (!phoneReg.test(mobile)) {
      return false;
    }
    return true;
  }

}));
