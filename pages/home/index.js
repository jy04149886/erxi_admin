var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
const config = require('./config');
var screen_height = 0;
var screen_width = 0;
const app = getApp()
var imageSize = app.globalData.imageSize
var userid;
var current_device_imei = 0;
var home_flag = true
var is_follow = false;
var interval = null
var interval_buzz = undefined
var is_page_init = 0
var is_device_data_init = 0
var current_location = undefined
var current_device_location = undefined
var switch_location_flag = false;
var center_location = undefined;
var circles = null;
var is_gps = undefined
var is_torch_light = 0
var torch_interval = null;
var is_buzz = 0
var start_follow = undefined
var end_follow = undefined
wx.getSystemInfo({
  success: function(res) {
    screen_height = res.windowHeight
    screen_width = res.windowWidth
  }
})
Page(Object.assign({
  data: {
    screen_height: screen_height,
    is_light: 0,
    is_buzz: 0,
    screen_width: screen_width,
    start_follow: "block",
    loading_follow: "none",
    end_follow: "none",
    controls: [{
      id: 1,
      iconPath: '/resources/location.png',
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }],
    img_mine: "/pages/images/mine" + imageSize + ".png",
    torch_nor: "/pages/images/torch_nor" + imageSize + ".png",
    buzzer_nor: "/pages/images/buzzer_nor" + imageSize + ".png",
    location_nor: "/pages/images/location_nor" + imageSize + ".png",
    Path1: "/pages/images/Path1" + imageSize + ".png",
    nol: "/pages/images/nol" + imageSize + ".png",
    sel: "/pages/images/sel" + imageSize + ".png",
    btn1: "/pages/images/1" + imageSize + ".png",
    btn2: "/pages/images/2" + imageSize + ".png",
    head_mine: '/pages/images/head_mine' + imageSize + '.png',
  },

  onLoad: function() {
    var _that = this
    wx.getStorage({
      key: 'userid',
      complete: function(res) {
        userid = res.data
        if (!userid) {
          wx.redirectTo({
            url: '/pages/login/index'
          })
          return false
        }
        qqmapsdk = new QQMapWX({
          key: 'TSVBZ-RYO6X-GX44T-7CTWU-ORI6S-72FFJ'
        });
        _that.initpage();
        _that.pagerefresh(5 * 1000);
      }
    })

    wx.getUserInfo({
      success: res => {
        wx.request({
          url: 'https://www.ju2xi.com/user/profile/updateUserInfo', //仅为示例，并非真实的接口地址
          method: 'POST',
          data: {
            uid: userid,
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            console.log(res.data)
          }
        })

        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
    setTimeout(function() {
      _that.loadAndUnload(1)
    }, 5000);

  },

  onUnload: function(e) {
    this.loadAndUnload(0)
    // if (current_device_imei)
    //   this.setDeviceUntrace()
  },

  onHide: function(e) {
    // if (current_device_imei)
    //   this.setDeviceUntrace()
    this.loadAndUnload(0)
    if (interval)
      clearInterval(interval)
  },

  onShow: function(e) {
    if (is_page_init > 0) {
      this.onLoad()
      // interval = setInterval(this.initpage, 1000 * 180)
    } else {
      is_page_init++
    }
  },

  setDeviceUntrace: function() {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setFollowmodel',
      data: {
        uid: userid,
        imei: current_device_imei,
        command: "00012,t180s",
        flag: 0
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {}
    })
  },

  pagerefresh: function(time) {
    if (interval)
      clearInterval(interval)
    interval = setInterval(this.initpage, time)
  },

  initpage: function() {
    var _that = this
    //获取当前设备
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getuserdevicelist',
      data: {
        userid: userid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var device_data_list = res.data.device_data_list
        var device_last = res.data.device_last
        var device_list = res.data.device_list
        if (device_data_list.length == 0) {
          wx.showToast({
            title: '请选保持设备卡机上传数据',
            icon: 'none',
            duration: 3000
          })
          setTimeout(function() {
            wx.navigateTo({
              url: '/pages/usercenter/index'
            })
            return false
          }, 3000);
          return false;
        }
        if (!device_last) {
          wx.showToast({
            title: '请选择当前设备',
            icon: 'none',
            duration: 3000
          })
          setTimeout(function() {
            wx.navigateTo({
              url: '/pages/usercenter/index'
            })
            return false
          }, 3000);
          return false;
        }
        if (device_list.length == 0) {
          wx.showToast({
            title: '请绑定设备',
            icon: 'none',
            duration: 3000
          })
          setTimeout(function() {
            wx.navigateTo({
              url: '/pages/usercenter/index'
            })
            return false
          }, 3000);
          return false;
        }
        center_location = {
          latitude: device_last.center_latitude,
          longitude: device_last.center_longitude
        }
        //判断设备是否到期
        var device_name_charge = undefined
        var device_name_text = undefined
        var title1 = undefined
        var title2 = undefined
        var timestamp1 = Date.parse(new Date()) / 1000;
        if (device_last.effect_time <= timestamp1) {
          device_name_charge = true
          title1 = "您的设备" + device_last.device_name + "已经到期，请去充值"
        }
        // if (device_last.text_number <= 0) {
        //   device_name_text = true
        //   title2 = "您的设备" + device_last.device_name + "通知条数余额不足，请去充值"
        // }
        if (device_name_charge) {
          wx.showToast({
            title: title1,
            icon: 'none',
            duration: 3000
          })
          setTimeout(function() {
            wx.navigateTo({
              url: '/pages/usercenter/index'
            })
            return false
          }, 3000);
          return false;
        }
        // if (device_name_text) {
        //   wx.showToast({
        //     title: title2,
        //     icon: 'none',
        //     duration: 3000
        //   })
        //   setTimeout(function () {
        //     wx.navigateTo({
        //       url: '/pages/usercenter/index'
        //     })
        //     return false
        //   }, 3000);
        //   return false;
        // }

        device_last.device_name = device_last.device_name ? device_last.device_name : ''
        is_follow = device_last.is_follow
        // var start_follow = device_last.is_follow == 1 ? "none" : "block"
        // var end_follow = device_last.is_follow == 0 ? "none" : "block"
        if (!start_follow || !end_follow) {
          start_follow = "block"
          end_follow = "none"
          _that.setData({
            start_follow: start_follow,
            end_follow: end_follow,
          })
        }
        var isHome_switch
        var range = device_last.range
        if (device_last.is_home == 1) {
          isHome_switch = _that.data.sel
        } else {
          isHome_switch = _that.data.nol
        }
        _that.setData({
          isHome: device_last.is_home == 1 ? 1 : 0,
          isHome_switch: isHome_switch,
          device_last: device_last
        })
        current_device_imei = device_last.imei
        var _polyline = []
        wx.getLocation({
          type: 'wgs84',
          success: function(res) {
            var latitude = res.latitude
            var longitude = res.longitude
            current_location = {
              latitude: latitude,
              longitude: longitude
            }

            var speed = res.speed
            var accuracy = res.accuracy
            // _polyline.push({ latitude: latitude, longitude: longitude })
            for (var i = 0; i < device_data_list.length; i++) {
              _polyline.push({
                latitude: device_data_list[i].latitude,
                longitude: device_data_list[i].longitude
              })
            }
            var polyline = [{
              points: _polyline,
              color: "#FF0000DD",
              width: 2,
              arrowLine: true
              // dottedLine: true
            }]
            var current_device = null
            var current_latitude = 0.0
            var current_longitude = 0.0
            var csq = 0
            var signal_point1 = ""
            var signal_point2 = ""
            var signal_point3 = ""


            if (device_data_list.length > 0) {
              current_device = device_data_list[device_data_list.length - 1]
              current_latitude = current_device.latitude
              current_longitude = current_device.longitude
              is_gps = current_device.is_gps
              is_gps = is_gps == 1 ? 'GPS' : 'WIFI'
              current_device_location = {
                latitude: current_latitude,
                longitude: current_longitude
              }
              csq = current_device.signalIntensity
              if (csq <= 33) {
                signal_point1 = "background-color: #09bb07;"
              } else if (csq > 33 && csq <= 66) {
                signal_point1 = "background-color: #09bb07;"
                signal_point2 = "background-color: #09bb07;"
              } else {
                signal_point1 = "background-color: #09bb07;"
                signal_point2 = "background-color: #09bb07;"
                signal_point3 = "background-color: #09bb07;"
              }

              if (is_device_data_init == 0) {
                var current_time_t = new Date().getTime();
                var t_time_sc = (current_time_t - current_device.create_time) / 1000
                if (t_time_sc < 60) {
                  _that.pagerefresh(60 * 1000);
                  is_device_data_init = 1
                }
              }

              _that.setData({
                is_gps: is_gps,
                signal_point1: signal_point1,
                signal_point2: signal_point2,
                signal_point3: signal_point3,
                voltage: current_device.electricQuantity ? current_device.electricQuantity : 0,
              })
              var marker_label_name = ''
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: current_latitude,
                  longitude: current_longitude
                },
                success: function(res) {
                  marker_label_name = res.result.formatted_addresses.recommend + current_device.data_time;
                  var avatar = _that.data.head_mine
                  if (device_last.avatar) {
                    avatar = device_last.avatar
                  }
                  wx.downloadFile({
                    url: avatar, //仅为示例，并非真实的资源
                    success: function(res_file) {
                      if (res_file.statusCode === 200) {
                        _that.setData({
                          markers: [{
                            iconPath: res_file.tempFilePath,
                            id: 1,
                            latitude: current_latitude,
                            longitude: current_longitude,
                            callout: {
                              content: marker_label_name,
                              borderRadius: 100,
                              display: 'ALWAYS',
                              fontSize: 14,
                              textAlign: 'center',
                              padding: 10
                            },
                            width: 25,
                            height: 25,
                          }]
                        })
                      }
                    }
                  })
                  circles = [{
                    latitude: device_last.center_latitude,
                    longitude: device_last.center_longitude,
                    color: '#FF0000DD',
                    fillColor: '#7cb5ec88',
                    radius: parseInt(range),
                    strokeWidth: 1
                  }]
                  if (device_last.is_home != 0 && device_last.center_latitude && device_last.center_longitude) {
                    _that.setData({
                      circles: circles
                    })
                  } else {
                    _that.setData({
                      circles: null
                    })
                  }
                },
                fail(res) {
                  wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 5000
                  })
                },
                complete(res) {}
              });
            }
            _that.setData({
              polyline: polyline
            })
            if (current_device_location.latitude && current_device_location.longitude) {
              _that.setData({
                location: current_device_location,
              })
            } else {
              _that.setData({
                location: current_location,
              })
            }
          }
        })
      }
    })
  },

  listengohome: function() {
    wx.navigateTo({
      url: '/pages/usercenter/index'
    })
    // console.log("go home")
  },

  listenbuzzer: function () {
    wx.showLoading({
      title: '发送中',
    })
    var cmd = ""
    if (is_buzz == 0) {
      is_buzz = 1
      cmd = is_buzz + ",6,10]"
    } else {
      is_buzz = 0
      cmd = is_buzz + ",0,0]"
    }
    var _that = this
    var command = "[SR*" + current_device_imei + "*00011*VOICE," + cmd
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: command
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        wx.showToast({
          title: '发送成功',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading()

        if (is_buzz == 1) {
          _that.setData({
            buzzer_nor: "/pages/images/buzzer_sel" + imageSize + ".png"
          })
        } else {
          _that.setData({
            buzzer_nor: "/pages/images/buzzer_nor" + imageSize + ".png"
          })
        }
      }
    })
  },

  sendbuzzcommand: function() {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        uid: userid,
        imei: current_device_imei,
        command: "90056,buzzer,10"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {}
    })
  },

  listenlocation: function() {
    var _that = this
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: "[SR*" + current_device_imei + "*0004*CR," + 1 + "]",
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        is_device_data_init = 0
        _that.pagerefresh(5 * 1000);
        wx.showToast({
          title: '设备将在30秒内推送数据',
          icon: 'none',
          duration: 4000
        })
      }
    })

    // if (current_device_location.latitude && current_device_location.longitude) {
    //   var _that = this
    //   if (!switch_location_flag) {
    //     _that.setData({
    //       location: current_location
    //     })
    //     switch_location_flag = true
    //   } else {
    //     _that.setData({
    //       location: current_device_location
    //     })
    //     switch_location_flag = false
    //   }
    // }
  },

  switch1Change: function(e) {
    var _that = this
    home_flag = this.data.isHome
    var command = "[SR*" + current_device_imei + "*0007*FENCE,";
    if (home_flag == 0) {
      command += "1]"
      var text = "开启围栏"
      this.setData({
        isHome: 1,
        isHome_switch: this.data.sel,
        circles: circles
      })
    } else {
      var text = "关闭围栏"
      command += "0]"
      this.setData({
        isHome: 0,
        isHome_switch: this.data.nol,
        circles: null
      })
    }
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setDevicehome',
      data: {
        imei: current_device_imei,
        flag: this.data.isHome,
        command: command,
        uid: userid,
        latitude: _that.data.location.latitude,
        longitude: _that.data.location.longitude,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        wx.showToast({
          title: text + '成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  listenlight: function() {
    wx.showLoading({
      title: '发送中',
    })
    if (is_torch_light == 0) {
      is_torch_light = 1
    } else {
      is_torch_light = 0
    }
    var _that = this
    var command = "[SR*" + current_device_imei + "*0002*LED," + is_torch_light + ",100,100,300]"
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: command
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {

        wx.showToast({
          title: '发送成功',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading()

        if (is_torch_light == 1) {
          _that.setData({
            torch_nor: "/pages/images/torch_sel" + imageSize + ".png",
          })
        } else {
          _that.setData({
            torch_nor: "/pages/images/torch_nor" + imageSize + ".png",
          })
        }
      }
    })
  },

  listen_start_follow: function() {
    var _that = this
    _that.setData({
      start_follow: "none",
      loading_follow: "block"
    })
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: "[SR*" + current_device_imei + "*0008*TRA,1,10]",
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.indexOf("ok") > -1) {
          _that.setData({
            end_follow: "block",
            loading_follow: "none"
          })

        }
      }
    })
  },

  listen_end_follow: function() {
    var _that = this
    _that.setData({
      end_follow: "none",
      loading_follow: "block"
    })
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: "[SR*" + current_device_imei + "*0008*TRA,0,10]",
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        if (res.data.indexOf('ok') > -1) {
          _that.setData({
            start_follow: "block",
            loading_follow: "none"
          })
        }
      }
    })
  },

  loadAndUnload: function(flag) {
    // wx.request({
    //   url: 'https://www.ju2xi.com/user/profile/setCommand',
    //   data: {
    //     imei: current_device_imei,
    //     command: "[SR*" + current_device_imei + "*0008*TRA,0,10]",
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function (res) { }
    // })
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: "[SR*" + current_device_imei + "*0004*CR," + flag + "]",
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {}
    })
  }

}));