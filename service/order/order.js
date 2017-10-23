var config = require('../../config');
var utils = require('../../common/utils/utils');
var ajax = require('../../common/ajax/ajax');
var host = config.host;
var handle = {
	getOrderDetail:function(param){
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
	pay:function(param){//支付订单
		var orderId = param.orderId;
		var callback = param.callback;
		_fn.payOrder( {
			orderId : orderId
		}, function( payRes ) {
			if ( !payRes || payRes.code != '0000' || !payRes.success ) {
				wx.showModal( {
					title : '提示',
					content : payRes.msg || '系统错误',
					showCancel : false,
					complete : function() { 
						if(callback && typeof callback === 'function'){
							callback(false);
						}
					}
				
				} );
				return;
			}
			// 3.唤醒微信支付
			_fn.wxPay( {
				timeStamp : payRes.data.timeStamp,
				nonceStr : payRes.data.nonceStr,
				package : 'prepay_id=' + payRes.data.prepayId,
				paySign : payRes.data.sign					
			}, function(res) {
				if(callback && typeof callback === 'function'){
					callback(res);
				}
				// wx.redirectTo( { url : '../orderdetail/orderdetail?orderId=' + orderId  } );
			} );
		} );
	}
}
var _fn = {
	payOrder : function( param, callback ) {
		ajax.query( {
			url : host + '/app/pay/wechatPrePay',
			param : param
		}, callback );		

	},
	wxPay : function( param, callback ) {
		wx.requestPayment( {
			timeStamp : param.timeStamp,
			nonceStr : param.nonceStr,
			package : param.package,
			signType : 'MD5',
			paySign : param.paySign,			
			success : function() {
				callback && callback( true );
			},
			fail : function( ) {
				callback && callback( false );
			}
		} );
	}
}

module.exports = handle;