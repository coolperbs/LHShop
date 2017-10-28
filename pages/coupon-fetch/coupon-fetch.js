var weigetUtil = require('../../common/utils/weigetUtil');
var List = weigetUtil.List;
var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var utils = require( '../../common/utils/utils' );

// var addressService = require('../../service/address/address');
var host = config.host
var couponeTypeEnum = {
	1:'满减券',
	2:'折扣券',
	3:'立减券'
}


Page({
	onLoad:function(){
		var self = this;
		_fn.init(self);
	},
	getCoupon:function(e){
		var self =this;
		var id = e.currentTarget.dataset.id;
		ajax.query({
			url:host+'/app/coupon/fetch/'+id
		},function(res){
			if(res.code === '0000'){
				wx.showToast({
					title:'领取成功,马上去使用吧'
				});
			}else{
				wx.showModal({
					showCancel:false,
					title:'提示',
					content:res.msg
				})
			}
			if(res.code === '0000' || res.code ==='1001'){
				var coupons = self.data.coupons;
				var newCoupons = coupons.map((v,k)=>{
					if(v.id === id){
						v.isFetch = true;
					}
					return v;
				});
				self.setData({
					coupons:newCoupons
				});
			}

		})

	}
});


var _fn = {
	init:function(page){
		page.couponList = new List({
			url:host + '/app/coupon',
			isSingle:true,
			render:function(data){
				page.setData({
					coupons:data.totalData
				})
			},
			getList:function(data){
				var retList = [];
				retList = data.data.map((v,k)=>{
					v.showProType = couponeTypeEnum[v.proType];
					v.showPrice = utils.fixPrice(v.proValue);
					v.showStartTime = utils.formateTime(v.startTime);
					v.showEndTime = utils.formateTime(v.endTime);
				})
				return data.data;
			},
			getHasMore:function(data){
				return false
			}

		});
		page.couponList.next();
	}
}

