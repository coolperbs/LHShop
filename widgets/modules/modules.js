var utils = require( '../../common/utils/utils.js' ),
	service = require( '../../service/service' ),
	events,
	handle;

handle = {}

handle.events = {
	jumpDetail : function( e ) {
		var id = e.currentTarget.dataset.id;
		if ( !id ){
			return;
		}
		wx.navigateTo( { url : '../detail/detail?id=' + id } );
	},

	addCart : function( e ) {
		var id = e.currentTarget.dataset.id;
		if ( !id ) {
			return;
		}
		service.cart.addOut( this, {
			skuId : id
		}, function( res ) {
			if ( res.code == '1000' ) {
				wx.navigateTo( {
					url : '../login/login'
				} );
				return;
			}
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			wx.showToast( { title : '添加成功!' } );
		} );
	}	
}

module.exports = handle;