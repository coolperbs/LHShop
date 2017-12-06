var data = require( './data.js' ),
	modules = require( '../../widgets/modules/modules.js' ),
	utils = require( '../../common/utils/utils' ),
	service = require( '../../service/service' ),
	handle,
	events,
	_fn;

handle = {
	render : function( callerPage ) {
		_fn.init( callerPage );

		// 定位获取门店信息
		utils.showLoading( { title : '定位中...' }, 300 );
		service.loc.getShops( function( shops ) {
			utils.hideLoading();
			//if ( !city || !city.code ) {
			// 	wx.navigateTo( { url : '../city/city' } );
			//}
			// 获取首页信息
			var shops = [],
				shopsList = wx.getStorageSync( 'shops' ) || [],
				i, len;

			for ( i = 0, len = shopsList.length; i < len; ++i ) {
				shops.push( shopsList[i].id );
			}
			service.active.getHome( { shops : shops.join( ',' ) }, function( res ) {
				var city = wx.getStorageSync( 'city' );
				if ( utils.isErrorRes( res ) ) {
					callerPage.setData( {
						'viewData.city' : city,
						'viewData.pageData' : {},
						'viewData.showShops' : false,
						'viewData.shops' : []
					} );
					return;
				}

				callerPage.setData( {
					'viewData.pageData' : res.data,
					'viewData.showShops' : false,
					'viewData.shops' : shopsList,
					'viewData.city' : city
				} );
			} );
		} );
	}
}

events = {
	toggleShops : function() {
		var self = this;
		self.setData( {
			'viewData.showShops' : !self.data.viewData.showShops
		} );
	},
	showShops : function( e ) {
		this.setData( {
			'viewData.showShops' : true
		} );
	},
	hideShops : function() {
		this.setData( {
			'viewData.showShops' : false
		} );
	},
	goHome : function( e ) {
		this.setData( {
			'viewData.showShops' : false
		} );
		wx.navigateTo( { url : '../shop/shop?shopid=' + e.currentTarget.dataset.shopid } );
	},
	goCity : function() {
		wx.navigateTo( { url : '../city/city' } );
	}
}

_fn = {
	init : function( callerPage ) {
		if ( callerPage.initedHome ) {
			return;
		}
		utils.mix( callerPage, {
	      homeClickProxy : function( e ) {
	        var target = e.currentTarget;
	        if ( target.dataset && target.dataset.fn && events[target.dataset.fn] ) {
	          events[target.dataset.fn].call( this, e );
	        }
	      }
	    } );
	    callerPage.initedHome = true;
	}
}

module.exports = handle;