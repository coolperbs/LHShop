var config = require('../../config');
var utils = require('../../common/utils/utils');
var ajax = require('../../common/ajax/ajax');
var host = config.host;

var couponCache;
var handle = {
	fetchCoupon :function(param){//领取优惠券
		var id = param.id;
		var callback = param.callback;
		ajax.query({
			url:host+'/app/coupon/fetch/'+id
		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})
	},
	cache : function( value ) {
		if ( arguments.length == 0 ) {	// 读操作
			return couponCache || 
			{
				available:[{"couponStatus":1,"created":1508601600000,"endTime":1509206400000,"id":1,"modified":1508601600000,"name":"满10011-20元","orderFieldNextType":"ASC","proType":1,"proValue":100,"shopId":1,"startTime":1508601600000,"status":1,"venderId":2274}],
				unavailable:[{"couponStatus":1,"created":1508601600000,"endTime":1509206400000,"id":1,"modified":1508601600000,"name":"满10022-20元","orderFieldNextType":"ASC","proType":1,"proValue":100,"shopId":1,"startTime":1508601600000,"status":1,"venderId":2274}]
			};
		}
		couponCache = value; // 写操作
	}
}




module.exports = handle;