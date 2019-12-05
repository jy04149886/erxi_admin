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
var is_device_status_flag = false
var cr_command_flag = 0
// var trace_device_flag = 0
var interval_trace_device = undefined
var device_locate_text = undefined
var device_state_text = undefined
var polyline = null
var is_polyline = true
var is_sub = 0
// var trace_status = false
var trace_intervals = null
var trace_outtime_key

var res = wx.getSystemInfoSync()
screen_height = res.windowHeight
screen_width = res.windowWidth
var pix = parseInt(res.pixelRatio)
Page(Object.assign({
  data: {
    marginLeft: (screen_width / 2) - 41,
    screen_height: screen_height,
    is_light: 0,
    is_buzz: 0,
    screen_width: screen_width,
    start_follow: "block",
    location_rate: 5,
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
    img_mine: "/pages/images/user_bg" + imageSize + ".png",
    torch_nor: "/pages/images/light_off" + imageSize + ".png",
    buzzer_nor: "/pages/images/buzzer_nor" + imageSize + ".png",
    location_nor: "/pages/images/trajectory" + imageSize + ".png",
    location_sel: "/pages/images/trajectory_color" + imageSize + ".png",
    Path1: "/pages/images/Path1" + imageSize + ".png",
    nol: "/pages/images/nol" + imageSize + ".png",
    sel: "/pages/images/sel" + imageSize + ".png",
    btn1: "/pages/images/circular" + imageSize + ".png",
    btn2: "/pages/images/circular_cancel" + imageSize + ".png",
    btn3: "/pages/images/circular_wait" + imageSize + ".png",
    head_mine: 'https://www.ju2xi.com/wx/images/head_mine' + imageSize + '.png',
    torch_light_flag: {},
    buzz_flag: {},
    // location_switch: "/pages/images/trajectory_color" + imageSize + ".png",
    // is_device_status_flag: is_device_status_flag,
  },

  onLoad: function () {
    var _that = this
    wx.getStorage({
      key: 'userid',
      complete: function (res) {
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
        _that.pagerefresh(10 * 1000);
      }
    })

    // trace_status = wx.getStorageSync('trace_status')

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
          success: function (res) {
            // console.log(res.data)
          }
        })

        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })

  },

  onUnload: function (e) {
    // this.loadAndUnload(0)
    // if (current_device_imei)
    //   this.setDeviceUntrace()
    clearInterval(interval)
  },

  onHide: function (e) {
    // if (current_device_imei)
    //   this.setDeviceUntrace()
    // this.loadAndUnload(0)
    if (interval)
      clearInterval(interval)
  },

  onShow: function (e) {
    var _that = this
    if (is_page_init > 0) {
      this.onLoad()
    } else {
      is_page_init++
    }
  },

  setDeviceUntrace: function () {
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
      success: function (res) { }
    })
  },

  pagerefresh: function (time) {
    if (interval)
      clearInterval(interval)
    interval = setInterval(this.initpage, time)
  },

  initpage: function () {
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
      success: function (res) {
        var device_data_list = res.data.device_data_list
        var device_last = res.data.device_last
        if (!device_last) {
          wx.redirectTo({
            url: '/pages/usercenter/index'
          })
          return false
        }
        is_sub = device_last.is_sub
        is_polyline = device_last.is_trace == 1 ? true : false
        if (device_last.is_trace == 1) {
          _that.setData({
            location_switch: _that.data.location_sel
          })
        } else {
          _that.setData({
            location_switch: _that.data.location_nor
          })
        }

        var last_online_time = 0
        if (device_last) {
          last_online_time = parseInt(device_last.last_online_time)
        }

        var device_list = res.data.device_list
        if (device_list && device_list.length == 0) {
          wx.navigateTo({
            url: '/pages/no_device/index'
          })
          return false
        }

        if (!device_last) {
          wx.showToast({
            title: '请选择当前设备',
            icon: 'none',
            duration: 3000
          })
          setTimeout(function () {
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
          setTimeout(function () {
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
        _that.setData({
          center_location: center_location
        })
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
        if (device_name_charge) {
          wx.showToast({
            title: title1,
            icon: 'none',
            duration: 3000
          })
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/usercenter/index'
            })
            return false
          }, 3000);
          return false;
        }

        device_last.device_name = device_last.device_name ? device_last.device_name : ''
        is_follow = device_last.is_follow
        // if (trace_status) {
        //   start_follow = "none"
        //   end_follow = "block"
        //   _that.setData({
        //     start_follow: start_follow,
        //     end_follow: end_follow,
        //     // start_follow: 5
        //   })
        // }
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

        //判断设备是否在追踪状态
        trace_outtime_key = 'trace_outtime' + current_device_imei
        wx.getStorage({
          key: trace_outtime_key,
          complete(res_trace) {
            var _traceTime = parseInt(res_trace.data) - parseInt(Date.parse(new Date()))
            // console.log(_traceTime)
            if (_traceTime > 0) {
              device_locate_text = '当前定位频率1min/次'
              device_state_text = '追寻中'
              _that.setData({
                end_follow: "block",
                loading_follow: "none",
                device_locate_text: device_locate_text,
                device_state_text: device_state_text,
              })
              setTimeout(function () {
                _that.listen_end_follow()
              }, _traceTime);
            }

            if (!res_trace.data || _traceTime <= 0) {
                device_locate_text = '当前定位频率5min/次'
                device_state_text = '运动中'
                _that.setData({
                  start_follow: "block",
                  end_follow: "none",
                  start_follow: 5,
                  device_locate_text: device_locate_text,
                  device_state_text: device_state_text,
                })
              }
            }
          })

        var device_init_page_flag = _that.data['device_page_init_flag' + current_device_imei]
        if (!device_init_page_flag) {
          _that.loadAndUnload(1)
          var device_page_init_data = {}
          device_page_init_data['device_page_init_flag' + current_device_imei] = true
          _that.setData(device_page_init_data)
        }

        try {
          var light_flag = wx.getStorageSync('torch_light_flag')
          var buzz_flag = wx.getStorageSync('buzz_flag')
        } catch (e) {
          // Do something when catch error
        }

        var t_light_flag = light_flag[current_device_imei]
        if (t_light_flag) {
          _that.setData({
            torch_nor: "/pages/images/light" + imageSize + ".png",
          })
        } else {
          _that.setData({
            torch_nor: "/pages/images/light_off" + imageSize + ".png",
          })
        }
        var is_buzz_flag = buzz_flag[current_device_imei]
        if (is_buzz_flag) {
          _that.setData({
            buzzer_nor: "/pages/images/buzzer_sel" + imageSize + ".png"
          })
        } else {
          _that.setData({
            buzzer_nor: "/pages/images/buzzer_nor" + imageSize + ".png"
          })
        }

        var _polyline = []
        wx.getLocation({
          type: 'wgs84',
          success: function (res) {
            var latitude = res.latitude
            var longitude = res.longitude
            current_location = {
              latitude: latitude,
              longitude: longitude
            }

            var speed = res.speed
            var accuracy = res.accuracy
            // _polyline.push({ latitude: latitude, longitude: longitude })
            if (is_polyline) {
              for (var i = 0; i < device_data_list.length; i++) {
                _polyline.push({
                  latitude: device_data_list[i].latitude,
                  longitude: device_data_list[i].longitude
                })
              }
            }
            polyline = [{
              points: _polyline,
              color: "#FF0000DD",
              width: 8,
              arrowLine: true,
              arrowIconPath: "/pages/images/arrowIconPath.png",
              // borderWidth:100,
              // width:5
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
              // _polyline.push(current_device_location)
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

              var current_time_t = new Date().getTime();
              // if (is_device_data_init == 0) {
              var current_time_t = new Date().getTime();
              // var t_time_sc = (current_time_t - current_device.create_time) / 1000
              // if (t_time_sc < 60) {
              // _that.pagerefresh(60 * 1000);
              // is_device_data_init = 1
              // }
              // }
              if (!device_locate_text || !device_state_text) {
                device_locate_text = '佩戴两分钟可激活设备'
                device_state_text = '休眠中'
                if (last_online_time) {
                  var t_time_ol = current_time_t - last_online_time
                  var second = Math.floor(t_time_ol / 1000);
                  if (second < 360) {
                    device_locate_text = '当前定位频率5min/次'
                    device_state_text = '运动中'
                  }
                }
                _that.pagerefresh(300 * 1000);
              } else {
                device_locate_text = _that.data.device_locate_text
                device_state_text = _that.data.device_state_text
                if (last_online_time) {
                  var t_time_ol = current_time_t - last_online_time
                  var second = Math.floor(t_time_ol / 1000);
                  if ((second < 60) && device_state_text == '追寻中') {
                    // device_locate_text = '当前定位频率1min/次'
                    // device_state_text = '追寻中'
                    // _that.pagerefresh(60 * 1000);
                  } else if (second < 360) {
                    device_locate_text = '当前定位频率5min/次'
                    device_state_text = '运动中'
                  } else {
                    device_locate_text = '佩戴两分钟可激活设备'
                    device_state_text = '休眠中'
                  }
                }
              }
              if (device_state_text == '休眠中') {
                try {
                  wx.setStorageSync('torch_light_flag', false)
                } catch (e) {
                  // Do something when catch error
                }
              }

              _that.setData({
                device_locate_text: device_locate_text,
                device_state_text: device_state_text,

                is_gps: is_gps,
                signal_point1: signal_point1,
                signal_point2: signal_point2,
                signal_point3: signal_point3,
                voltage: current_device.electricQuantity ? current_device.electricQuantity : 0,
                voltage_color: current_device.electricQuantity < 10 ? '#32e11a' : '#000000',
                // is_device_status_flag: is_device_status_flag
              })



              try {
                var light_flag = wx.getStorageSync('torch_light_flag')
                var buzz_flag = wx.getStorageSync('buzz_flag')
              } catch (e) {
                // Do something when catch error
              }

              var t_light_flag = light_flag[current_device_imei]
              if (t_light_flag && device_state_text != '休眠中') {
                _that.setData({
                  torch_nor: "/pages/images/light" + imageSize + ".png",
                })
              } else {
                _that.setData({
                  torch_nor: "/pages/images/light_off" + imageSize + ".png",
                })
              }

              var marker_label_name = ''
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: current_latitude,
                  longitude: current_longitude
                },
                success: function (res) {
                  var _d = current_device.date.substr(0, 2) + "-" + current_device.date.substr(2, 2) + "-" + current_device.date.substr(4, 2)
                  var _t = current_device.time.substr(0, 2) + ":" + current_device.time.substr(2, 2) + ":" + current_device.time.substr(4, 2)
                  marker_label_name = res.result.formatted_addresses.recommend + _d + " " + _t;
                  var avatar = _that.data.head_mine
                  if (device_last.avatar) {
                    avatar = device_last.avatar
                  }
                  wx.downloadFile({
                    url: avatar, //仅为示例，并非真实的资源
                    success: function (res_file) {
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
                complete(res) { }
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

  listengohome: function () {
    wx.navigateTo({
      url: '/pages/usercenter/index'
    })
  },

  listenbuzzer: function () {
    wx.showLoading({
      title: '发送中',
    })
    var _that = this
    try {
      var buzz_flag = wx.getStorageSync('buzz_flag')
      if (!buzz_flag) {
        buzz_flag = {}
      }
    } catch (e) {
      // Do something when catch error
    }
    is_buzz = buzz_flag[current_device_imei] ? buzz_flag[current_device_imei] : 0
    var cmd = ""
    if (is_buzz == 0) {
      is_buzz = 1
      cmd = is_buzz + ",6,10]"
    } else {
      is_buzz = 0
      cmd = is_buzz + ",0,0]"
    }
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
      success: function (res) {
        wx.hideLoading()
        if (res.data == 'ok') {
          wx.showToast({
            title: '发送成功',
            icon: 'none',
            duration: 2000
          })

          if (is_buzz == 1) {
            _that.setData({
              buzzer_nor: "/pages/images/buzzer_sel" + imageSize + ".png"
            })
          } else {
            _that.setData({
              buzzer_nor: "/pages/images/buzzer_nor" + imageSize + ".png"
            })
          }

          buzz_flag[current_device_imei] = is_buzz
          try {
            wx.setStorageSync('buzz_flag', buzz_flag)
          } catch (e) { }
        } else {
          wx.showToast({
            title: '发送失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  sendbuzzcommand: function () {
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
      success: function (res) { }
    })
  },

  listenlocation: function () {
    if (is_sub != 0) {
      wx.showToast({
        title: '监护人无控制权限',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var _that = this
    // if (_that.data.device_state_text == '休眠中') {
    //   wx.showToast({
    //     title: '请唤醒设备再操作',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return false;
    // }

    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setDeviceTrace',
      data: {
        imei: current_device_imei,
        is_trace: !is_polyline ? 1 : 0,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        var res = res.data
        var msg_text
        if (res.status) {
          if (is_polyline) {
            _that.setData({
              polyline: null,
              location_switch: _that.data.location_nor
            })
            msg_text = '隐藏轨迹'
          } else {
            _that.setData({
              polyline: polyline,
              location_switch: _that.data.location_sel
            })
            msg_text = '显示轨迹'
          }
          is_polyline = !is_polyline
          wx.showToast({
            title: msg_text,
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '设置失败',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })


  },

  switch1Change: function (e) {
    if (is_sub != 0) {
      wx.showToast({
        title: '监护人无控制权限',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var _that = this
    // if (_that.data.device_state_text == '休眠中') {
    //   wx.showToast({
    //     title: '请唤醒设备再操作',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return false;
    // }
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
      success: function (res) {
        wx.showToast({
          title: text + '成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  listenlight: function () {
    if (is_sub != 0) {
      wx.showToast({
        title: '监护人无控制权限',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var _that = this
    if (_that.data.device_state_text == '休眠中') {
      wx.showToast({
        title: '请唤醒设备再操作',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    wx.showLoading({
      title: '发送中',
    })
    try {
      var light_flag = wx.getStorageSync('torch_light_flag')
      if (!light_flag) {
        light_flag = {}
      }
    } catch (e) {
      // Do something when catch error
    }
    is_torch_light = light_flag[current_device_imei] ? light_flag[current_device_imei] : 0
    if (is_torch_light == 0) {
      is_torch_light = 1
    } else {
      is_torch_light = 0
    }
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
      success: function (res) {
        wx.hideLoading()
        if (res.data == 'ok') {
          wx.showToast({
            title: '发送成功',
            icon: 'none',
            duration: 2000
          })

          if (is_torch_light == 1) {
            _that.setData({
              torch_nor: "/pages/images/light" + imageSize + ".png",
            })
          } else {
            _that.setData({
              torch_nor: "/pages/images/light_off" + imageSize + ".png",
            })
          }
          light_flag[current_device_imei] = is_torch_light
          try {
            wx.setStorageSync('torch_light_flag', light_flag)
          } catch (e) { }
        } else {
          wx.showToast({
            title: '发送失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  listen_start_follow: function () {
    if (is_sub != 0) {
      wx.showToast({
        title: '监护人无控制权限',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var _that = this
    if (_that.data.device_state_text == '休眠中') {
      wx.showToast({
        title: '请唤醒设备再操作',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    _that.setData({
      start_follow: "none",
      loading_follow: "block",
      start_follow: 1
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
      success: function (res) {
        if (res.data.indexOf("ok") > -1) {
          device_locate_text = '当前定位频率1min/次'
          device_state_text = '追寻中'
          _that.setData({
            end_follow: "block",
            loading_follow: "none",
            device_locate_text: device_locate_text,
            device_state_text: device_state_text,
          })
          // trace_device_flag = 1
          _that.pagerefresh(300 * 1000);
          var trace_outtime_value = Date.parse(new Date()) + 600 * 1000
          wx.setStorage({
            key: trace_outtime_key,
            data: trace_outtime_value
          })
          setTimeout(function () {
            _that.listen_end_follow()
          }, 600 * 1000);
          // wx.setStorageSync('trace_status', true)
        }

        wx.showToast({
          title: '开启成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  listen_end_follow: function () {
    if (is_sub != 0) {
      wx.showToast({
        title: '监护人无控制权限',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var _that = this
    if (_that.data.device_state_text == '休眠中') {
      wx.showToast({
        title: '请唤醒设备再操作',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

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
      success: function (res) {
        if (res.data.indexOf('ok') > -1) {
          device_locate_text = '当前定位频率5min/次'
          device_state_text = '运动中'
          _that.setData({
            start_follow: "block",
            loading_follow: "none",
            start_follow: 5,
            device_locate_text: device_locate_text,
            device_state_text: device_state_text,
          })
          // trace_device_flag = 0
          _that.pagerefresh(300 * 1000);
          wx.setStorage({
            key: trace_outtime_key,
            data: null
          })
          wx.showToast({
            title: '关闭成功',
            icon: 'none',
            duration: 2000
          })
          // wx.setStorageSync('trace_status', false)
        }
      }
    })
  },

  loadAndUnload: function (flag) {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setCommand',
      data: {
        imei: current_device_imei,
        command: "[SR*" + current_device_imei + "*0004*CR," + flag + "]",
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) { }
    })
  },

  timeToDate: function (time) {
    var date = new Date(time)
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y + M + D + h + m + s
  }

}));