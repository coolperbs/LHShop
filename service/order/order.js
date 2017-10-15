var config = require('../../config');
var utils = require('../../common/utils/utils');
var ajax = require('../../common/ajax/ajax');
var host = config.host;
var handle = {
	getOrderDetail:function(param){
		console.log(123,param);
		var orderId = param.orderId;
		var callback = param.callback;
		ajax.query({
			url:host+'/app/order/info',
			param:{orderId:orderId}

		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})
	},
	deleteOrder:function(){
		var orderId = param.orderId;
		var callback = param.callback;
		ajax.query({
			url:host+'/app/order/delete',
			param:{orderId:orderId}

		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})

	},
	cancelOrder:function(){
		var orderId = param.orderId;
		var callback = param.callback;
		ajax.query({
			url:host+'/app/order/cancel',
			param:{orderId:orderId}

		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})
	}
}

module.exports = handle;