// const Zan = require('../../zanui-weapp-dev/dist/index');
// const config = require('./config');
const app = getApp()
var imageSize = app.globalData.imageSize
var countdown = 60;

Page(Object.assign({
  data: {
    tu: "/pages/images/tu" + imageSize + ".png",
    btn_getcode_text:'获取验证码',
    btn_disabled:false,
  },


  listenerPhoneInput: function (e) {
    this.data.phone = e.detail.value;
  },

  listenerPasswordInput: function (e) {
    this.data.password = e.detail.value;
  },

  listenercheckcodeInput: function (e) {
    this.data.checkcode = e.detail.value;
  },

  doregist: function (e) {
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
      url: 'https://www.ju2xi.com/user/register/doRegister',
      method: 'POST',
      data: {
        mobile: username,
        password: password,
        reg_type: 2,
        code: checkcode
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.status) {
          wx.showToast({
            title: "注册成功",
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
          title: '短信验证码发送成功',
          icon: 'none'
        })
        _that.settime()
      }
    })
  },

  settime: function (){
    var _that = this
    if (countdown == 0) {
      _that.setData({
        btn_disabled: false,
        btn_getcode_text:'获取验证码'
      })
      countdown = 60;
    } else {
      _that.setData({
        btn_disabled: true,
        btn_getcode_text: countdown + '秒'
      })
      countdown--;
      setTimeout(function () {
        _that.settime()
      }, 1000)
    }
  },

  checkmobile: function (mobile) {
    var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
    if (!phoneReg.test(mobile)) {
      return false;
    }
    return true;
  }

}));
