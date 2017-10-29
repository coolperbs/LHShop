var weigetUtil = require('../../common/utils/weigetUtil');
var List = weigetUtil.List;
var Tab = weigetUtil.tab;
var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var utils = require( '../../common/utils/utils' );
var couponService = require('../../service/coupon/coupon');

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
		var usefulCoupon = couponService.cache();
		self.usefulCoupon = usefulCoupon || {};
		self.usefulCoupon.available = self.usefulCoupon.available || [];
		self.usefulCoupon.unavailable = self.usefulCoupon.unavailable || [];
		self.tabType = 'available';
		couponService.cache({});
		_fn.init(self);
	},
	useCoupon:function(e){
		var self =this;
		var id = e.currentTarget.dataset.id;
		if(self.tabType === 'available'){
			self.usefulCoupon.available.map((v,k)=>{
				if(v.id === id ){
					couponService.cache(null)
					v.isUse = true;
					couponService.cache({
						selectCoupon:v
					});
				}else{
					v.isUse = false;
				}
				return v;
			});
			self.setData({
				coupons:self.usefulCoupon[self.tabType]
			})
		}else{
			wx.showModal({
				title:'提示',
				content:'这张优惠券还不能使用哦',
				showCancel:true
			});
		}
		
	},
	changeTab:function(e){
		var self = this;
		//切换tab
		var tabData = self.tab.change(e);
		self.setData({tab:tabData});
		//切换数据
		var extraParam = JSON.parse(e.currentTarget.dataset.extra);
		self.tabType = extraParam.type
		self.setData({
			coupons:self.usefulCoupon[self.tabType]
		})
	},
	back:function(e){
		var type = e.currentTarget.dataset.type;
		if(type === 'cancel' ){
			couponService.cache({});
		}
		console.log(couponService.cache());
		wx.navigateBack();
	}
});


var _fn = {
	init:function(page){
		_fn.createTab(page);
		page.usefulCoupon.available.map((v,k)=>{
			v.showProType = couponeTypeEnum[v.proType];
			// v.showPrice = utils.fixPrice(v.proValue);
			v.showPrice = v.proValue;
			v.showStartTime = utils.formateTime(v.startTime);
			v.showEndTime = utils.formateTime(v.endTime);
			return v;

		})	
		page.usefulCoupon.unavailable.map((v,k)=>{
			v.showProType = couponeTypeEnum[v.proType];
			// v.showPrice = utils.fixPrice(v.proValue);
			v.showPrice = v.proValue;
			v.showStartTime = utils.formateTime(v.startTime);
			v.showEndTime = utils.formateTime(v.endTime);
			return v;
			
		})	
		page.setData({
			coupons:page.usefulCoupon.available
		})
	},
	createTab:function(page){
		page.tab = new Tab({
			offset:120,
			tabs:[{
				name:"可使用",
				extra:JSON.stringify({type:'available'}),
			},{
				name:'不可使用',
				extra:JSON.stringify({type:'unavailable'}),
			}]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({tab:tabData});
	}
}


