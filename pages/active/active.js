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
		service.active.getActive( {
			actId : pageParam.actid,
			shops : '1'
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

