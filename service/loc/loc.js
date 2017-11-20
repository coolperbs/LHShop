var ajax = require('../../common/ajax/ajax'), 
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
	url, CFG, _fn, handle;


url = {
	shopList : app.host + '/app/store/list'
}


handle = {
	getShops : function( callback ) {
		var shops = wx.getStorageSync( 'shops' );
		var city = wx.getStorageSync( 'city' );

		if ( shops && shops.length && city && city.code ) {
			callback( shops );
			return;
		}

		// 获取地址信息
		handle.getLocInfo( function( res ) {
			handle.getShopList( callback );
		} );
	},
	getShopList : function( callback ) {
		var city = wx.getStorageSync( 'city' );
		if ( city && !city.code ) {
			return;
		}
		ajax.query( {
			param : {
				citycode : city.code,
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

	getLocInfo : function( callback ){
		var city = wx.getStorageSync( 'city' );
		if ( city ) {
			callback( city );
			return;
		}
		// 1.根据定位获取地址信息
		// 获取坐标
		wx.getLocation( {
			type : 'gcj02',
			success : function( loc ) {
				wx.showModal( {
					title : '提示',
					content : '不能获取坐标，请手动选择城市',
					showCancel : false,
					complete : function() {
						wx.navigateTo( { url : '../city/city' } );
					}
				} );				
				//handle.getShopList( callback );
			},
			fail : function() {
				wx.showModal( {
					title : '提示',
					content : '不能获取坐标，请手动选择城市',
					showCancel : false,
					complete : function() {
						wx.navigateTo( { url : '../city/city' } );
					}
				} );
			}
		} );		
	}
};


module.exports = handle;