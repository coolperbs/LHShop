var service = require( '../../service/service' ),
	us = require('../../lib/underscore'),
	utils = require('../../common/utils/utils'),
	weigetUtil = require('../../common/utils/weigetUtil'),
	 List = weigetUtil.List,
	 config = require('../../config'),
	 host = config.host,
	handle,
	events,
	dataHandler,
	_fn;

handle = {
	name : 'mine',
	//data : data.data,
	render : function( callerPage ) {
		console.log('mine');
		_fn.init( callerPage );
		// 请求数据，渲染数据
		wx.getStorage({
			key:'userinfo',
			success:function(res){
				var userinfo = res.data.user;
				userinfo.showCreated = utils.formateTime(userinfo.created);
				dataHandler.setData({
					userinfo:userinfo
				})
			}
		});
	},

	events : {
		goOrderList : function( caller, e ) {
			var status = e.currentTarget.dataset.status;
			wx.navigateTo({
				url:'../../pages/orderlist/orderlist?status='+status
			});
		},
		goMyCoupon :function(){
			wx.navigateTo({
				url:'../../pages/coupon-mine/coupon-mine'
			});
		},
		goAddressList:function(){
			wx.navigateTo({
				url:'../../pages/addresslist/addresslist'
			})
		},
		goLogin:function(){
			wx.navigateTo({
				url:'../../pages/login/login'
			})
		},
		goFavorite:function(){
			wx.navigateTo({
				url:'../../pages/favorite/favorite'
			})
		},
		goAftersale:function(){
			wx.navigateTo({
				url:'../../pages/aftersalelist/aftersalelist'
			})
		},
		goJoin:function(){
			wx.navigateTo({
				url:'../../pages/join/join'
			})
		},
		getNextPage:function( caller,e){
			var favoriteList = caller.mineData.favoriteList;
			favoriteList.next();
		},
		goFxMemebers:function(){
			wx.navigateTo({
				url:'../../pages/fx-members/fx-members'
			})
		},
		goFxConsumeList:function(){
			wx.navigateTo({
				url:'../../pages/fx-consumeList/fx-consumeList'
			})
		},
		goFxMoneyApply:function(){
			wx.navigateTo({
				url:'../../pages/fx-moneyapply/fx-moneyapply'
			})
		},
		goFxShopOrders:function(){
			wx.navigateTo({
				url:'../../pages/fx-shoporders/fx-shoporders'
			})
		}
	}
}

_fn = {
	init : function( callerPage ) {
		if(!callerPage.initMine){
			callerPage.mineData = callerPage.mineData || {};
			dataHandler = new DataHandler(callerPage);
			_fn.createFavoriteList(callerPage);
			callerPage.initMine = true;
		}
	},
	createFavoriteList:function(callerPage){
		wx.getSystemInfo({
			success:function(res){
				var scrollHeight = (res.windowHeight)+'px';
				dataHandler.setData({
					scrollHeight:scrollHeight
				});
			}
		});
		callerPage.mineData.favoriteList = new List({
			url:host+'/app/ware/like',//adsdfaf
			param:{//adfafasdf
				// type:status
				citycode:wx.getStorageSync('city').code||'010'
			},
			getList:function(res){
				return res.data.wareSkus
			},
			getHasMore:function(res){
				return res.data.hasMore || false;
			},
			render:function(res){
				dataHandler.setData({
					favorite:{
						data:{
							wareSkus:res.totalData
						}
					}
				});
			}
		});
		callerPage.mineData.favoriteList.next();
	}
}

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

module.exports = handle;