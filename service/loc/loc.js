var ajax = require('../../common/ajax/ajax'), 
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
	url, CFG, _fn, handle;


url = {
	shopList : app.host + '/app/store/list'
}


handle = {
	getShops : function( callback ) {
		handle.getShopList( callback );
	},
	getShopList : function( callback ) {
		var shops = wx.getStorageSync( 'shops' );
		if ( shops ) {
			callback( shops );
			return;
		}
		ajax.query( {
			param : {
				citycode : '028',
				lat : 1,
				lng : 2
			},
			url : url.shopList
		}, function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			res.data = res.data;
			res.data.stores = res.data.stores || [];
			wx.setStorageSync( 'shops', res.data.stores );
			callback( wx.getStorageSync( 'shops' ) );
		} );
	},
	getLocInfo : function(){
		// 1.调用定位
		// 2.根据定位获取地址信息
	}
};


module.exports = handle;