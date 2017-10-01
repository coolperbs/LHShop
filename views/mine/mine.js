var handle, _fn, events, DataHandler, dataHandler,
utils = require( '../../common/utils/utils' ),
service = require( '../../service/service' ),
us = require('../../lib/underscore'),
navigateLock = false,//navigateTo 的lock
userService = service.user;

handle = {
	render : function( callerPage ) {
		utils.hideLoading();
		_fn.init( callerPage );
		_fn.render(callerPage);
		callerPage.initedMine = true;
	},
};

events = {
	towallet:function(event){
		utils.navigateTo({
			url:'../wallet/wallet',
			success:function(){
				navigateLock = false
			}
		});
	},
	buyvip:function(){
		utils.navigateTo({
			url:'../buyvip/buyvip'

		});
	},
	toLogin:function(event){
		utils.navigateTo({
			url:'../login/login'

		});
	},
	toAbout:function(){
		utils.navigateTo({
			url:'../about/about'
		});
	},
	toPrivilege:function(){
		utils.navigateTo({
			url:'../privilege/privilege'
		});
	},
	toMyCoupon:function(){
		utils.navigateTo({
			url:'../mycoupon/mycoupon'
		});
	}

};
var DataHandler = function(callerPage){
	this.callerPage = callerPage;
	this.mineData = {};
	this.setData = function(data){
		var isCurrentPage = this.callerPage.data.currentView == 'mine';
		if(!isCurrentPage){
			return;
		}
		var mineData = us.extend(this.mineData,data);
		this.callerPage.setData({
			viewData:{
				mine:mineData
			}
		});
	};
	this.getData = function(){
		return this.mineData;
	};

};

_fn = {
	init : function( callerPage ) {
		callerPage.setData({
			currentView : 'mine'
		});
		utils.mix( callerPage, events );
		dataHandler = new DataHandler(callerPage);
		callerPage.initedMine = true;
	},
	render : function(){
		var self = this;
		_fn.getPageData(res => {
			if(res.code === '0000'){
				var balance = res.data.balance.balance||0;
				balance = (balance/100).toFixed(2);
				dataHandler.setData({
					user:{
						nickName:res.data.nickName,
						name:res.data.name,
						balance:balance,
						sex:res.data.sex,
						isVip:res.data.type===1?false:true,
						couponValidCount:res.data.couponValidCount
					}
				});
			}else if(res.code === 'GW1005'){
				dataHandler.setData({needLogin:true});
			}
		});
	},
	getPageData:function(callback){
		// utils.showLoading();
		userService.getUserDetail(res=>{
			// utils.hideLoading();
			if(typeof callback === 'function'){
				callback(res);
			}
		});
	}
};

module.exports = handle;
