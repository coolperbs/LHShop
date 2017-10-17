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
	deleteOrder:function(param){
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
	cancelOrder:function(param){
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
	},
	getOrderStatusMining:function(status){
		let statusDict = [
			{code:8,status:'WaitingPay',label:'待支付'},
			{code:16 ,status:'WaitingProduction', label:' 待生产'},
			{code:32,status:'Producting', label:'生产中'},
			{code:64,status:'WaitingPickup', label:'待自提，待取货'},
			{code:128,status:'Delivery', label:'配送中'},
			{code:256,status:'Complete', label:'妥投'},
			{code:512,status:'Finished',label:'已完成'},
			{code:1024 ,status:'Canceled', label:'已取消'},
		]
		let statusInfo = statusDict.filter((v,k)=>{
			return v.code.toString() === status.toString();
		});
		if(statusInfo && statusInfo[0]){
			return statusInfo[0];
		}else{
			return {code:0,status:'common',label:'common'};
		}
	},
}

module.exports = handle;