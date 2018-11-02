// const Zan = require('../../zanui-weapp-dev/dist/index');
// const config = require('./config');
var userid = undefined
const app = getApp()
var imageSize = app.globalData.imageSize

Page(Object.assign({
  data: {
    tu: '/pages/images/tu' + imageSize + '.png',
  },

  onLoad: function () {
    try {
      userid = wx.getStorageSync('userid')
    } catch (e) {
      // Do something when catch error
    }
  },

  listenerPhoneInput: function (e) {
    this.data.phone = e.detail.value;

  },

  closePopup: function () {

    this.setData({
      showPopup: false
    });
    //登陆成功跳转页面

  },

  // listenerPasswordInput: function (e) {
  //   this.data.password = e.detail.value;
  // },

  listenercheckcodeInput: function (e) {
    this.data.checkcode = e.detail.value;
  },

  doregist: function (e) {
    var _that = this
    var phone = this.data.phone;
    var checkcode = this.data.checkcode;
    
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
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
      url: 'https://www.ju2xi.com/user/profile/bindingMobile', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        mobile: phone,
        userid: userid,
        verification_code:checkcode
        
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {

        if (res.data.status) {
          try {
            wx.setStorageSync('user_token', res.data.user.token)
          } catch (e) {
          }
          if (!res.data.user.user_pass){
            wx.navigateTo({
              url: '/pages/edit_password/index'
            })
          }else{
            // wx.redirectTo({
            //   url: '/pages/home/index'
            // })
            wx.navigateBack({
              delta: 2
            })
          }
          
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        })
        
      }
    })
  },
  listenergetcheckcode:function(e){
    var phone = this.data.phone
    var _that = this
    if (!phone){
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return false
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/verificationCode/send_verify_code', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        mobile: phone
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.showToast({
          title: '短信验证码发送成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }

}));
