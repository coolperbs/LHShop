var service = require( '../../service/service' ),
	handle,
	events,
	_fn;

handle = {
	name : 'home',
	//data : data.data,
	render : function( callerPage ) {
		console.log('mine');
		_fn.init( callerPage );
		// 请求数据，渲染数据
	},

	events : {
		goOrderList : function( caller, e ) {
			wx.navigateTo({
				url:'../../pages/orderlist/orderlist'
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
		}
	}
}

_fn = {
	init : function( callerPage ) {
		var datetime = wx.getStorageSync( 'datetime' ),
			city = wx.getStorageSync( 'city' ),
			allDay;

		allDay = datetime[1].time - datetime[0].time;
		allDay = Math.round( allDay / ( 24 * 60 * 60 * 1000 ) );
		callerPage.setData( {
			viewData : {
				datetime : datetime,
				allDay : allDay,
				city : city
			}
		} );
	}
}

module.exports = handle;