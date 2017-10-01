var handle, CFG, _fn, error, url,
	ajax = require( '../../common/ajax/ajax' ),
	config = require( '../../config' ),
	utils = require( '../../common/utils/utils' );

url = {
	itemInfo : config.HOST.appGateWay + '/app/ware/detail'	// 考虑接口的剥离方哪里？
}

handle = {
	getInfo : function( param, callback ) {

		ajax.query( {
			url : url.itemInfo + '/' + param.shopId + '/' + param.sku
		}, callback );
	}
};


module.exports = handle;