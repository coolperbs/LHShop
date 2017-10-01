var handle,
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	config = require('../../config'),
	env = config.env,
	hostTrading = config.host.trading[env];

handle = {
	getOrderList : {//获取订单列表
		url:hostTrading+'/mch/order/list'
	},
	getOrderWares:{//获取订单商品
		url:hostTrading+'/mch/order/wareList'
	},
	getOrderDetail:{//获取订单详情
		url:hostTrading+'/mch/order/info'
	},
	cancelOrder:{//取消订单
		url:hostTrading+'/mch/order/cancel'
	},
	delOrder:{//删除订单
		url:hostTrading+'/mch/order/del'
	},
	
	getOrderStatusMining:function(status){
		let statusDict = [
			{code:8,status:'WaitingPay',label:'待支付'},
			{code:16 ,status:'WaitingProduction', label:' 待生产'},
			{code:32,status:'Producting', label:'生产中'},
			{code:64,status:'WaitingPickup', label:'待自提，待取货'},
			{code:128,status:'Delivery', label:'配送中'},
			{code:256,status:'Complete', label:'妥投'},
			{code:512,status:'Finished',label:'完成'},
			{code:1024 ,status:'Canceled', label:'取消'},
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
	getStatus : {//评论订单商品
		url:hostTrading+'/mch/order/pickflow'
	}

}
module.exports = service(handle);