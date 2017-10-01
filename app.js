var user = require( 'service/user/user' );
var uuid = require( 'common/uuid/uuid' );

App( {
	globalData:{
		evt:"dev"//使用环境
	},
	onLaunch:function(){
		var userInfo = wx.getStorageSync( 'userInfo' );
		user.createTempId();
		if ( !userInfo || !userInfo.token ) {
			wx.removeStorageSync( 'isMergeCart' );
		}
		return;
	}
});
