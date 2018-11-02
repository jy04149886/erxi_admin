var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
const config = require('./config');
var screen_height = 0;
var screen_width = 0;
const app = getApp()
var imageSize = app.globalData.imageSize
var userid = undefined;
var current_device_imei = 0;
var home_flag = true
var is_follow = false;
var interval = null
var interval_buzz = undefined
var is_page_init = true
var current_location = undefined
var device_id = undefined
var home_latitude = undefined
var home_longitude = undefined
var home_range = undefined
Page(Object.assign({
  data: {
    is_light: 0,
    is_buzz: 0,
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
    dingwei: '/pages/images/dingwei' + imageSize + '.png',
  },


  onLoad: function(option) {
    var _that = this
    wx.getSystemInfo({
      success: function(res) {
        screen_height = (res.windowHeight) * 2 - 400
        // screen_height = (screen_height - 214) * 2
        screen_width = res.windowWidth
        _that.setData({
          screen_height: screen_height,
          screen_width: screen_width,
        })
      }
    })
    is_page_init = false
    userid = wx.getStorageSync('userid')
    qqmapsdk = new QQMapWX({
      key: 'VMOBZ-FEIK6-R5KSZ-MGHQO-G2IXO-ZCBCX'
    });
    device_id = option.device_id
    _that.initpage(device_id);
    // _that.pagerefresh(180 * 1000);
  },

  initpage: function(device_id) {
    var _that = this
    wx.getUserInfo({
      success: res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })

    //获取当前设备
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/getDeviceDetailInfo',
      data: {
        device_id: device_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var device_info = res.data
        home_latitude = device_info.center_latitude
        home_longitude = device_info.center_longitude
        home_range = device_info.range
        var location = {
          latitude: device_info.center_latitude,
          longitude: device_info.center_longitude
        }

        var circles = [{
          latitude: location.latitude,
          longitude: location.longitude,
          color: '#FF0000DD',
          fillColor: '#7cb5ec88',
          radius: parseInt(device_info.range),
          strokeWidth: 1
        }]

        _that.getLocationInfo(location.latitude, location.longitude)

        _that.setData({
          location: location,
          circles: circles,
          device_name: device_info.device_name,
          range: parseInt(device_info.range),
        })
      }
    })
  },

  getLocationInfo: function(latitude, longitude) {
    var _that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        var location_name = res.result.formatted_addresses.recommend

        _that.setData({
          location_name: location_name
        })
      },
    });
  },

  listenSetrange: function(e) {
    home_range = e.detail.value
    // wx.request({
    //   url: 'https://www.ju2xi.com/user/profile/setEnclosureRange',
    //   data: {
    //     range: range,
    //     device_id: device_id
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success: function(res) {
    //     console.log(res.data)
    //   }
    // })
  },

  chooseLocationListner: function(e) {
    var _that = this
    wx.getLocation({
      success: function(res) {
        console.log(res)
        wx.chooseLocation({
          success: function(res1) {
            console.log(res1);
            var address = res1.address
            home_latitude = res1.latitude
            home_longitude = res1.longitude
            _that.getLocationInfo(home_latitude, home_longitude)
            wx.showToast({
              title: '地点设置成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function() {},
          complete: function() {}
        });
      }
    })
  },

  complete_submit: function() {
    wx.request({
      url: 'https://www.ju2xi.com/user/profile/setEnclosureRange',
      data: {
        range: home_range,
        device_id: device_id,
        latitude: home_latitude,
        longitude: home_longitude
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data)
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          // wx.redirectTo({
          //   url: '/pages/usercenter/index'
          // })

          wx.navigateBack({
            delta: 2
          })
          return false
        }, 2000);
      }
    })
  }
}));