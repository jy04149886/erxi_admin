//index.js
//获取应用实例
const app = getApp()
var imageSize = app.globalData.imageSize
var device_id = undefined;
var userid = undefined
var imei = undefined

Page({
  data: {
    location_equ: "/pages/images/location_equ" + imageSize + ".png",
    location_equ: "/pages/images/location_equ" + imageSize + ".png",
  },
  onLoad: function(option) {
    device_id = option.d_id
    try {
      userid = wx.getStorageSync('userid')
    } catch (e) {
      // Do something when catch error
    }
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
      success: function(res) {
        var text_number = res.data.text_number
        imei = res.data.imei
        _that.setData({
          end_time: res.data.end_time,
          avatar: res.data.avatar ? res.data.avatar : _that.data.location_equ,
          contract_phone: res.data.contract_phone,
          range: res.data.range,
          device_name: res.data.device_name,
          device_id: device_id,
          text_number: text_number ? text_number : 0
        })
      }
    })

    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowHeight: res.windowHeight
        })
      }
    })

    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })


  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  editinfobtn: function() {
    wx.navigateTo({
      url: '/pages/edit_device_info/index?device_id=' + device_id
    })
  },

  listenSetrange: function(e) {
    var range = e.detail.value
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setEnclosureRange',
      data: {
        range: range,
        device_id: device_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data)
      }
    })
  },

  unbinddevice: function() {
    wx.showModal({
      title: '提示',
      content: '确定解除绑定',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: 'https://www.ju2xi.com/user/profile/unbindDevice',
            data: {
              device_id: device_id,
              uid: userid
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function(res) {
              if (res.data.status) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 2000
                })
                setTimeout(function() {
                  // wx.redirectTo({
                  //   url: '/pages/usercenter/index'
                  // })
                  wx.navigateBack({
                    delta: 1
                  })
                }, 2000);
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  listenCharg: function(e) {
    var d_id = e.currentTarget.dataset.value
    wx.navigateTo({
      url: '/pages/service_pay_detail/index?id=' + d_id
    })
  },

  listenEnclosure: function(e) {
    var d_id = e.target.dataset.value
    wx.navigateTo({
      url: "/pages/setEnclosure/index?device_id=" + d_id
    })
  },

  poweroffListener: function() {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: imei,
        command: "[SG*" + imei + "*0008*POWEROFF]"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        wx.showToast({
          title: '操作成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  uploadaudioListener: function() {
    const recorderManager = wx.getRecorderManager()

    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
    })
    recorderManager.onStop((res) => {
      const {
        tempFilePath
      } = res
      console.log('recorder stop', tempFilePath)
      wx.uploadFile({
        url: 'https://www.ju2xi.com/user/profile/uploadDeviceBuzz',
        filePath: tempFilePath,
        name: 'file',
        formData: {
          imei: imei
        },
        success: function(res) {
          if (res.data.indexOf('ok')>-1) {
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '上传失败',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    })
    recorderManager.onFrameRecorded((res) => {
      const {
        frameBuffer
      } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })

    const options = {
      duration: 5000,
      sampleRate: 8000,
      numberOfChannels: 1,
      encodeBitRate: 16000,
      format: 'mp3',
      frameSize: 50
    }

    recorderManager.start(options)
    // wx.chooseImage({
    //   success: function (res) {
    //     var size = res.tempFiles[0].size
    //     var path = res.tempFiles[0].path
    //     if (path.indexOf('.AMR') < 0 && path.indexOf('.amr') < 0) {
    //       wx.showToast({
    //         title: '请上传AMR格式文件',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //       return;
    //     }
    //     if (size > 20480) {
    //       wx.showToast({
    //         title: '音频大小不能超过20k',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //       return;
    //     }
    //     wx.getFileSystemManager().readFile({
    //       filePath: path,
    //       encoding: 'binary',
    //       success: function (res) {
    //         var data = res.data
    //         var size = data.length
    //         var len = "0002"
    //         var command = "[SG*" + imei + "*" + len + "*TK," + data + "]"
    //         wx.request({
    //           url: 'https://www.ju2xi.com/user/profile/setCommand',
    //           method: 'post',
    //           data: {
    //             imei: imei,
    //             command: command
    //           },
    //           header: {
    //             'content-type': 'application/json' // 默认值
    //           },
    //           success: function (res) {
    //             console.log(res)
    //             if (res.data == 'ok\n') {
    //               wx.showToast({
    //                 title: '上传成功',
    //                 icon: 'success',
    //                 duration: 2000
    //               })
    //             } else {
    //               wx.showToast({
    //                 title: '上传失败',
    //                 icon: 'none',
    //                 duration: 2000
    //               })
    //             }
    //           }
    //         })
    //       },
    //       fail: function (res) {
    //         console.log(res)
    //       },
    //       complete: function (res) {
    //         // console.log(res)
    //       }
    //     })
    //     // wx.uploadFile({
    //     //   url: 'https://www.ju2xi.com/user/profile/uploadDeviceBuzzle',
    //     //   filePath: path,
    //     //   name: 'file',
    //     //   formData: {
    //     //     'imei': imei
    //     //   },
    //     //   success: function (res) {
    //     //     var data = res.data
    //     //     //do something
    //     //     console.log(res)
    //     //     if(data == 1){
    //     //       wx.showToast({
    //     //         title: '上传成功',
    //     //         icon: 'success',
    //     //         duration: 2000
    //     //       })
    //     //     } else {
    //     //       wx.showToast({
    //     //         title: data.error,
    //     //         icon: 'none',
    //     //         duration: 2000
    //     //       })
    //     //     }
    //     //   }
    //     // })
    //   }
    // })
  }
})