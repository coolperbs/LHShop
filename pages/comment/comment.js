var weigetUtil = require('../../common/utils/weigetUtil');
var orderService = require('../../service/order/order');
var utils = require('../../common/utils/utils');
var FileUploader = weigetUtil.FileUploader;
var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var host = config.host;
var app = getApp();

Page({
	onShareAppMessage : app.shareFunc,
	onLoad:function(param){
		var self = this;
		var orderId = param.orderId;
		var skuId = param.skuId;
		this.typeEnum = [{name:'退货',key:'1'},{name:'换货',key:'2'},{name:'维修',key:'3'}];
		self.param = {
			orderId:orderId,
			skuId:skuId
		}
		self.formData = {
			orderId:orderId,
			skuId:skuId,
			star:5,
			type:2
		}
		self.setData({
			type:this.typeEnum,
			formData:self.formData
		});
		_fn.init(self);
	},
	changeFile:function(e){
		// console.log(123,e);
		var self = this;
		self.fileUploader.change(e);
	},
	changeInput:function(e){
		var key = e.currentTarget.dataset.key;
		var val = e.detail.value;
		var self = this;
		self.formData = self.formData || {};
		if(key==="type"){
			val = self.formData['type']===1?2:1
		}
		self.formData[key] = val;
		self.setData({formData:self.formData});
	},
	changeStar:function(e){
		var self = this;
		var val = e.currentTarget.dataset.value+1;
		self.formData.star = val;
		self.setData({formData:self.formData});
	},
	submit:function(){
		var formData = this.formData;
		// console.log(formData);
		// return 
		var url = host+'/app/comment/submit';
		// /app/comment/submit评论
		ajax.query({
			url:url,
			param:formData
		},function(res){
			if(res.code==='0000'){
				wx.showModal({
					title:'提示',
					content:'申请成功',
					showCancel:false,
					success:function(res){
						if(res.confirm){
							wx.navigateBack()
						}
					}
				})
			}else{
				wx.showModal({
					title:'错误',
					content:res.msg+'('+res.code+')',
					showCancel:false
				})
			}
		});
	}
});
var _fn = {
	init:function(page){
		_fn.getOrderDetail(page,function(res){
			if(res.code === '0000' && res.data && res.data.order && res.data.order.skus){
				var skuId = page.param.skuId;
				var ware = res.data.order.skus.filter((v,k)=>{
					v.showOriginPrice = utils.fixPrice(v.originPrice);
					return v.skuId = skuId;
				})[0];
				page.setData({
					ware:ware
				});
			}
		});
		page.fileUploader = new FileUploader({
			orderId:page.param.orderId,
			files:[],
			max:9,
			afterChange:function(res){
				if(res.btns){
					res.btns.forEach((v,k)=>{
						if(JSON.parse(v.eventParam).type==="finished"){
							var imgKey = 'img'+(k+1);
							page.formData[imgKey] = v.imgUrl
						}
					});
				}
				page.setData({
					uploadData:res
				});
			}
		});
		var uploadData = page.fileUploader.change()
	},
	getOrderDetail :function(page,callback){
		var orderId = page.param.orderId;
		orderService.getOrderDetail({
			orderId : orderId,
			callback: function(res){
				if(callback && typeof callback === 'function'){
					callback(res);
				}
			}
		})
	},

}