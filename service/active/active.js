var handle,
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	config = require('../../config'),
	env = config.env,
	activeGateWay = config.host.activeGateWay[env];

handle = {
	getInfo : function( param, callback ) {	// param = { shopId : 1, activeId : 2 }
		if ( !param.shopId || !param.activeId ) {
			return;
		}

		var url = activeGateWay + '/';
		url += 'act/render/' + param.shopId + '/' + param.activeId
		ajax.query({
			url : url
		},function( res ){
			if(typeof callback==="function"){
				callback(res);
			}
		});		
	}
}

module.exports = service( handle );