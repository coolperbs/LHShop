var utils = require( '../../common/utils/utils.js' ),
	modules = require( '../../widgets/modules/modules.js' ),
	service = require( '../../service/service.js' ),
	data = require( 'data.js' ),
	pageParam,
	_fn;

Page( {
	onLoad : function( options ) {
		pageParam = options || {};
		_fn.getStoreInfo( this );
	},
	moduleClickProxy : function( e ) {
		var target = e.currentTarget;
		if ( target.dataset && target.dataset.fn && modules.events[target.dataset.fn] ) {
		  modules.events[target.dataset.fn].call( this, e );
		}
    }
} );

_fn = {
	getStoreInfo : function( caller ) {
		utils.showLoading( 300 );

		var shops = [],
			shopsList = wx.getStorageSync( 'shops' ) || [],
			i, len;

		for ( i = 0, len = shopsList.length; i < len; ++i ) {
			shops.push( shopsList[i].id );
		}		
		service.active.getActive( {
			actId : pageParam.actid,
			shops : shops.join( ',' )
		}, function( res ) {
			utils.hideLoading();
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			wx.setNavigationBarTitle( { title : res.data.title || '' } );
			caller.setData( {
				pageData : res.data || {}
			} );
		} );
	}
}

