var ajax = require('../../common/ajax/ajax'), 
	error = require( '../error' ),
	utils = require( '../../common/utils/utils' ),
	config = require( '../../config.js' ),
	url, CFG, _fn, handle, addressInfo;




handle = {
	// 缓存存储下,目前没有地址管理机制
	cache : function( value ) {
		if ( arguments.length == 0 ) {	// 读操作
			return addressInfo || {};
		}
		addressInfo = value; // 写操作
	}
}

module.exports = handle;