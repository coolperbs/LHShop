var service = require( '../../service/service' ),
	us = require('../../lib/underscore'),
	utils = require('../../common/utils/utils'),
	weigetUtil = require('../../common/utils/weigetUtil'),
	ajax = require('../../common/ajax/ajax'),
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
		_fn.init( callerPage );
// <<<<<<< HEAD
// 		// 请求数据，渲染数据
// 		wx.getStorage({
// 			key:'userinfo',
// 			success:function(res){
// 				var userinfo = res.data.user;
// 				if ( userinfo && userinfo.created ) {
// 					userinfo.showCreated = utils.formateTime(userinfo.created);
// =======
		_fn.getUserDetail(function(res){
			if(res.data){
				var userinfo = res.data;
				// userinfo.showCreated = utils.formateTime(userinfo.created);
				userinfo.userMoney = userinfo.userMoney || 0
				userinfo.userPoint = userinfo.userPoint || 0
				userinfo.showUserLevel = userinfo.levelInfo || 1
				userinfo.showUserMoney = {
					int:(userinfo.userMoney/100).toFixed(2).split('.')[0],
					float:(userinfo.userMoney/100).toFixed(2).split('.')[1],
//>>>>>>> 64b2d35da167ae9f1dea51c82e10c2bc4429c5af
				}
				dataHandler.setData({
					userinfo:userinfo
				});
			}

		})
	},

	events : {
		redirect:function(caller,e){
			var pagename = e.currentTarget.dataset.pagename;
			var url = '../../pages/'+pagename+'/'+pagename;
			wx.navigateTo({url:url});
		},
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
		goFxTeam:function(){
			wx.navigateTo({
				url:'../../pages/fx-team/fx-team'
			})
		},
		goFxMoney:function(){
			wx.navigateTo({
				url:'../../pages/fx-money/fx-money'
			})
		},
		goFxTakeMoney:function(){
			wx.navigateTo({
				url:'../../pages/fx-takemoney/fx-takemoney'
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
	getUserDetail:function(callback){
		var url = host+"/app/user/info"
		ajax.query({
			url:url
		},function(res){
			console.log(res)
			callback(res);
		})
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