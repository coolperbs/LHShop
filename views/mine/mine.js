var service = require( '../../service/service' ),
	us = require('../../lib/underscore'),
	utils = require('../../common/utils/utils'),
	handle,
	events,
	dataHandler,
	_fn;

handle = {
	name : 'home',
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
				url:'../../pages/mycoupon/mycoupon'
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
		}
	}
}

_fn = {
	init : function( callerPage ) {
		// var datetime = wx.getStorageSync( 'datetime' ),
		// 	city = wx.getStorageSync( 'city' ),
		// 	allDay;

		// allDay = datetime[1].time - datetime[0].time;
		// allDay = Math.round( allDay / ( 24 * 60 * 60 * 1000 ) );
		// callerPage.setData( {
		// 	viewData : {
		// 		datetime : datetime,
		// 		allDay : allDay,
		// 		city : city
		// 	}
		// } );
		dataHandler = new DataHandler(callerPage);
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