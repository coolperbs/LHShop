var handle, CFG, _fn, error, url,
	ajax = require( '../../common/ajax/ajax' ),
	config = require( '../../config' ),
	utils = require( '../../common/utils/utils' );

CFG = {
	storeName : 'userinfo'	//前端key
}

url = {
	storeInfo : config.HOST.appGateWay + '/app/store/page',	// 考虑接口的剥离方哪里？
	main : config.HOST.appGateWay + '/app/index'
}

handle = {
	getMain : function() {
		var param, callback;
		if ( arguments.length == 1 ) {
			callback = arguments[0];
		} else if ( arguments.length == 2 ) {
			param = arguments[0];
			callback = arguments[1];
		}
		ajax.query( {
			url : url.main
		}, callback );
	},
	getInfo : function( storeId, callback ) {
		ajax.query( {
			url : url.storeInfo + '/' + storeId
		}, callback );
	}
};
_fn = {

	isErrorRes : function( res ) {
		if ( !res || !res.code === '0000' || !res.data ) {
			return true;
		}
		return false;
	}
}


error = {
	success : { code : '0000', msg : '' }
}

module.exports = handle;