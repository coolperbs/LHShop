var _fn,
    service =  require( '../../service/service' ),
    utils = require('../../common/utils/utils'),
    couponService = service.coupon;
Page({
	onShow:function(){
		var self = this;
		self.setData({
			curTab:'offline',
			page:0,
			isLast:false,
			curCouponList:[]
		});
		_fn.initScorllArea(self)
		_fn.showCoupon(self);
	},
	changeTab:function(event){
		var self = this;
		var tabName = event.currentTarget.dataset.tabname;
		self.setData({
			curTab:tabName,
			page:0,
			isLast:false,
			curCouponList:[]
		});
		_fn.showCoupon(self);
	},
	loadMore:function(){
		var self = this;
		var isDataLoading = self.data.dataLoading;
		var isLast = self.data.isLast;
		if(isDataLoading||isLast){
			return;
		}else{
			var newPageNo = self.data.pageNo/1+1;
			self.setData({
				pageNo:newPageNo,
				dataLoading:true
			});
			_fn.showCoupon(self)
		} 
	}
});
var _fn = {
	initScorllArea:function(caller){
		wx.getSystemInfo({
			success:res=>{
				let windowHeight = res.windowHeight;
				let scrollHeight =( windowHeight-50)
				caller.setData({scrollHeight:scrollHeight});
			},
			fail:res=>{
				let scrollHeight ='550';//如果拿不到systeminfo，就只兼容iphone6
				caller.setData({scrollHeight:scrollHeight});
			}
		});

	},
	showCoupon:function(caller){
		var isLast = caller.data.isLast;
		if(isLast){
			return;
		}
		var curTab = caller.data.curTab || 'offline';
		if(curTab === 'offline'){
			_fn.getOffLineCouponData(caller)
		}else{
			_fn.getOnlineCouponData(caller);
		}
	},
	getOffLineCouponData:function(caller){
		var page = caller.data.page;
		var param = {
			pageNo:page
		}
		couponService.getUserOfflineCoupon(param,function(res){
			if(res.code === '0000'){
				var curCouponList = caller.data.curCouponList||[];
				var newCoupons = res.data.result;
				if(newCoupons && newCoupons.length>0){
					curCouponList = curCouponList.concat(newCoupons);
					caller.setData({
						curCouponList:curCouponList,
						dataLoading:false,
						isLast:res.data.lastPage
					});
				}
			}
		});
	},
	getOnlineCouponData:function(caller){
		var page = caller.data.page;
		var param = {
			pageNo:page
		}
		couponService.getUserOnlineCoupon(param,function(res){
			var curCouponList = caller.data.curCouponList||[];
			console.log(res);

		});

	}
}