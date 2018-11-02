const app = getApp()
var imageSize = app.globalData.imageSize
var userid = undefined

Page(Object.assign({
  data: {
    bound: '/pages/images/bound' + imageSize + '.png',
  },
  onLoad: function () {
    userid = wx.getStorageSync('userid')
  },

  scanercode:function(){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        wx.request({
          url: 'https://www.ju2xi.com/user/profile/bindDevice',
          method: 'POST',
          data: {
            uid: userid,
            imei: res.result
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
      }
    })
  },

  inputimei:function(e){
    this.data.imei = e.detail.value
  },

  bindDevice:function(imei){
    if (!this.data.imei){
      wx.showToast({
        title: '请输入设备IMEI',
        icon: 'none',
        duration: 3000
      })
      return null;
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/bindDevice',
      method: 'POST',
      data: {
        uid: userid,
        imei: this.data.imei
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.status){
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/home/index'
            })
            // wx.navigateBack({
            //   delta: 1
            // })
          }, 2000);
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  }
}));
