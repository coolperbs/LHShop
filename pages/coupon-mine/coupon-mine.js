var weigetUtil = require('../../common/utils/weigetUtil');
var List = weigetUtil.List;
var Tab = weigetUtil.tab;
var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var utils = require( '../../common/utils/utils' );
var host = config.host;


Page({
	onShow:function(){
		// console.log('mycoupon')
		var self =this;
		_fn.init(self);
	},
	changeTab:function(e){
		var self = this;
		//切换tab
		var tabData = self.tab.change(e);
		self.setData({tab:tabData});
		//切换数据
		var extraParam = JSON.parse(e.currentTarget.dataset.extra);
		var couponStatus = extraParam.couponStatus;
		self.listMap = self.listMap || {};
		self.list = self.listMap[couponStatus]
		if(!self.list){
			self.list = _fn.createList(self,{couponStatus:couponStatus})
			self.list.next();
		}else{
			self.setData({
				coupons:self.list.totalData
			});
		}
	},
	scrollToLower:function(e){
		var self = this;
		self.list.next();
	},
});
var couponeTypeEnum = {
	1:'满减券',
	2:'折扣券',
	3:'立减券'
}

var _fn =  {
	init:function(page){
		wx.getSystemInfo({
			success:function(res){
				var scrollHeight = res.windowHeight-60;
				page.setData({
					scrollHeight:scrollHeight

				});
			}
		});
		_fn.createTab(page);
		page.list = _fn.createList(page,{couponStatus:1});
		page.list.next();
	},
	createTab:function(page){
		page.tab = new Tab({
			offset:80,
			tabs:[{
				name:"未使用",
				extra:JSON.stringify({couponStatus:1}),
			},{
				name:'已使用',
				extra:JSON.stringify({couponStatus:2}),
			},{
				name:'已过期',
				extra:JSON.stringify({couponStatus:3}),
			}]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({tab:tabData});
	},
	createList:function(page,param){
		var couponStatus = param.couponStatus || 1;
		var reqParam = {};
		reqParam.couponStatus = couponStatus;
		

		var dataList = new List({
			url:host+'/app/coupon/me',
			param:reqParam,
			getList:function(data){
				data.data.coupon.map((v,k)=>{
					v.showProType = couponeTypeEnum[v.proType];
					v.showPrice = utils.fixPrice(v.proValue);
					v.showStartTime = utils.formateTime(v.startTime);
					v.showEndTime = utils.formateTime(v.endTime);
					return v
				})
				return data.data.coupon;
			},
			getHasMore:function(res){
				return res.hasMore;
			},
			render:function(res){
				page.setData({
					coupons:res.totalData
				})
			}
		});
		page.listMap = page.listMap || {};
		page.listMap[couponStatus] = dataList;
		return dataList;
	}
}