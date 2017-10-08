// pages/contact/contact.js
// var app = getApp();
// const SERVER_BASE = app.globalData.config.base;
// const WxParse = require('../../wxParse/wxParse');
// Page({
//   data: {
//     contact:{},
//     calling:{}
//   },

//   onLoad: function (options) {
//     var that=this;
// // ;
//     //https://mshop.yimeixinxijishu.com/Mobile/Api/aboutUs
//     // 你暂时先用这个接口
//     wx.request({
//       url: `${SERVER_BASE}/Mobile/Api/aboutUs`,
//       method: 'GET',
//       header: {
//         'content-type': 'application'
//       },
//       success: function (res) {
//         console.log(res);
//          that.setData({
//            contact: res.data,
//            calling: res.data.mobile
//          })
//       }
//     })
//   },
//   calling(){
//     wx.makePhoneCall({
//       phoneNumber:this.data.calling,
//       success: function (res) {
//         console.log(res+"拨打电话成功！")
//       },
//       fail: function (res) {
//         console.log(res+"拨打电话失败！")
//       }
//     })
//   }

//   })
Page({
  onShow:function(){
    console.log('contact');
  }
})
