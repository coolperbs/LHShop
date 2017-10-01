var handle,
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	config = require('../../config'),
	env = config.env,
	hostTrading = config.host.trading[env],
	hostAppGateWay = config.host.appGateWay[env];
handle = {
	getOrderAftersales:{
		url:hostTrading+'/mch/user/favorite/add'
	},
	submit:{
		url:hostTrading+'/mch/user/favorite/list'

	},
	getReasons:{
		url:hostTrading+'/mch/user/favorite/del'
	}
}


module.exports = service(handle);