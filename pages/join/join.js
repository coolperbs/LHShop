
var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var host = config.host;


Page({
    onShow:function(){
        console.log('join')
    },
    editAddinfo:function(e){
    	var dataset = e.currentTarget.dataset;
    	var key = dataset.type;
    	var val = e.detail.value;
    	var self = this;
    	self.formData = self.formData || {};
    	self.formData[key] = val; 
    },
    submit:function(){
    	var self = this;
    	_fn.submit(self);
    },
    switchConsent() {
    	var self = this;
        self.isConsent = !self.isConsent;
        this.setData({
            isConsent:self.isConsent
        });
    },
    /*
     * 协议显示
     */
    agreementShow() {
        console.log('1');
        this.setData({
            isShow: true
        })
    },
    /*
     * 协议隐藏
     */
    agreementHide() {
        this.setData({
            isShow: false
        })
    },

});
var _fn = {
	submit :function(page){
		var validateRes = _fn.validate(page);
		if(validateRes){
			var formData = page.formData;
			ajax.query({
				url:host+'/app/store/apply',
				param:formData
			},function(res){
				if(res.code==='0000'){
					wx.showModal({
						title:'提示',
						content:'申请成功,我们会尽快与您联系',
						success:function(){
							wx.reLaunch({
								url:'../index/index'
							});
						}
					});
				}else{
					wx.showModal({
						title:'提示',
						content:res.msg
					});
				}
			});
		}
	},
	validate:function(page){
		var formData = page.formData||{};
		var errMsg,validateRes=true;
		var isConsent = page.isConsent;
		switch(true){
			case !isConsent:
				errMsg = "请阅读入驻协议";
				validateRes=false;
				break;
			case !formData.name:
				errMsg = '请输入店铺名称';
				validateRes = false;
				break;
			case !formData.subname:
				errMsg = '请输入主营项目'
				validateRes = false;
				break;
			case !formData.telphone:
				errMsg = "请输入手机号码"
				validateRes = false;
				break;
			case formData.telphone.length != 11:
				errMsg = "请输入正确手机号码"
				validateRes = false;
				break;
			case !formData.userName:
				errMsg = "请输入您的姓名"
				validateRes = false;
				break;
			default:
				break;
		}
		if(errMsg){
			wx.showModal({
				title:"提示",
				content:errMsg,
				showCancel:false
			})
		}
		return validateRes;

	}
}



// //获取应用实例
// var app = getApp();

// /*获取基础配置服务器地址*/
// const SERVER_BASE = app.globalData.config.base;

// Page({

//     /**
//      * 页面的初始数据
//      */
//     data: {
//         isShow: false,
//         etitInfo: {
//             shop: '',
//             info: '',
//             name: '',
//             phone: ''
//         },
//         canScroll: true,
//         classList: [],
//         typeIndex: 0,
//         isConsent: true
//     },

//     /**
//      * 生命周期函数--监听页面加载
//      */
//     onLoad: function(options) {
//       var that = this;
//       wx.getSystemInfo({
//         success: function (res) {
//           that.setData({
//             clientHeight: res.windowHeight
//           });
//         }
//       });
//     },

//     /**
//      * 生命周期函数--监听页面初次渲染完成
//      */
//     onReady: function() {
//         this.getClass();
//     },

//     /**
//      * 生命周期函数--监听页面显示
//      */
//     onShow: function() {

//     },

//     /**
//      * 生命周期函数--监听页面隐藏
//      */
//     onHide: function() {

//     },

//     /**
//      * 生命周期函数--监听页面卸载
//      */
//     onUnload: function() {

//     },

//     /**
//      * 页面相关事件处理函数--监听用户下拉动作
//      */
//     onPullDownRefresh: function() {

//     },

//     /**
//      * 页面上拉触底事件的处理函数
//      */
//     onReachBottom: function() {

//     },

//     /**
//      * 用户点击右上角分享
//      */
//     onShareAppMessage() {

//         let title = app.globalData.config.title;
//         return {
//             title: title,
//             path: '/pages/index/index',
//             success: function(res) {
//                 // 转发成功
//             },
//             fail: function(res) {
//                 // 转发失败
//             }
//         }
//     },
//     /*
//      * 
//      */
//     /*
//     switchConsent() {

//         let isConsent = this.data.isConsent;
//         this.setData({
//             isConsent: !isConsent
//         })
//     },
//     /*
//      * 协议显示
//      */
//     agreementShow() {
//         console.log('1');
//         this.setData({
//             isShow: true
//         })
//     },
//     /*
//      * 协议隐藏
//      */
//     agreementHide() {
//         this.setData({
//             isShow: false
//         })
//     },
//      * 获取class分类
//      */
//     getClass() {
//         let self = this;
//         wx.request({
//             url: `${SERVER_BASE}Mobile/Api/getshopClass`,
//             method: 'GET',
//             header: {
//                 'content-type': 'application'
//             },
//             success: function(res) {
//                 self.setData({
//                     classList: res.data.data
//                 })
//             }
//         });
//     },
    
//      * 选择分类
     
//     choiceType(ev) {
//         let index = ev.detail.value;
//         this.setData({
//             typeIndex: index
//         })
//     },
//     /*
//      * 编辑信息
//      */
//     editAddinfo(ev) {

//         let inputType = ev.currentTarget.dataset.type,
//             etitInfo = this.data.etitInfo,
//             val = ev.detail.value;

//         etitInfo[inputType] = val;

//         this.setData({
//             etitInfo
//         })
//     },
//     /*
//      * 提交信息
//      */
//     submit() {

//         const rePhone = /^1(3|4|5|7|8)\d{9}$/;

//         let shop = this.data.etitInfo.shop,
//             type = this.data.classList[this.data.typeIndex].id,
//             info = this.data.etitInfo.info,
//             name = this.data.etitInfo.name,
//             phone = this.data.etitInfo.phone;

//         let isConsent = this.data.isConsent;

//         if (isConsent) {
//             if (shop && type && info && name && rePhone.test(phone)) {
//                 wx.request({
//                     url: `${SERVER_BASE}Mobile/Api/addStoreApply`,
//                     method: 'GET',
//                     header: {
//                         'content-type': 'application'
//                     },
//                     data: {
//                         act: 'add',
//                         shop_name: shop,
//                         shop_class: type,
//                         shop_contact: name,
//                         shop_mobile: phone,
//                         shop_desc: info
//                     },
//                     success: function(res) {
//                         if (res.data.data == '添加成功' || res.data.error == 0) {
//                             wx.showToast({
//                                 title: '申请成功',
//                                 icon: 'success',
//                                 duration: 2000
//                             })
//                         }

//                     }
//                 });
//             } else {
//                 wx.showModal({
//                     title: '提示',
//                     content: '输入的信息有误',
//                     showCancel: false,
//                     success: function(res) {

//                     }
//                 })
//             }
//         } else {
//             wx.showModal({
//                 title: '提示',
//                 content: '请同意申请协议',
//                 showCancel: false,
//                 success: function(res) {

//                 }
//             })
//         }
//     }

// })