var handle,
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	config = require('../../config'),
	env = config.env,
	hostTrading = config.host.trading[env];
handle = {
	getUserOnlineCoupon:{
		url:hostTrading+'/mch/coupon/online'
	},
	getUserOfflineCoupon:{
		url:hostTrading+'/mch/coupon/offline'
	}
}
module.exports = service(handle);