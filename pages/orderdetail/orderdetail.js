var config = require('../../config');
var utils = require('../../common/utils/utils');
var orderService = require('../../service/order/order')

Page({
	onLoad:function(param){
		var self =this; 
		self.param = param
		console.log('orderdetail');
		_fn.init(self);
	},
	toAddressList:function(){
		wx.navigateTo({
			url:'../addresslist/addresslist'
		});
	},
	payOrder:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		orderService.pay({
			orderId:orderId,
			callback:function(res){
				_fn.init(self);
			}
		})

	},

	delete:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		var eventParam = e.currentTarget.dataset.param;
		var self = this;
		wx.showModal({
			title:'提示',
			content:'您确定要删除这笔订单么?',
			success:function(res){
				if(res.confirm){
					orderService.deleteOrder({
						orderId:orderId,
						callback:function(res){
							_fn.init(self);
						}
					});
				}
			}
		})

	},
	cancel:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		var eventParam = e.currentTarget.dataset.param
		var self = this;
		wx.showModal({
			title:'提示',
			content:'您确定要取消这笔订单么?',
			success:function(res){
				if(res.confirm){
					orderService.cancelOrder({
						orderId:orderId,
						callback:function(res){
							_fn.init(self);
						}
					});
				}
			}
		});
	},
	toComment:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		var skuId = e.currentTarget.dataset.skuid;
		wx.navigateTo({
			url:'../comment/comment?orderId='+orderId+'&skuId='+skuId
		})

	},
	toAftersale:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		var skuId = e.currentTarget.dataset.skuid;
		wx.navigateTo({
			url:'../aftersale/aftersale?orderId='+orderId+'&skuId='+skuId
		})
	}
});
var _fn = {
	init:function(page){
		_fn.getData(page,function(res){
			page.setData({
				detail:res.data
			});
		});
	},
	getData:function(page,callback){
		var orderId = page.param.orderid;
		orderService.getOrderDetail({
			orderId:orderId,
			callback:function(res){
				if(res.code === '0000'){
					var resData = res.data;
					var resDattOrder = resData.order;
					var orderTimeObj = utils.timeToDateObj(resDattOrder.orderTime)

					resDattOrder.showOrderTime = orderTimeObj.year +'-'+ orderTimeObj.month +"-"+ orderTimeObj.day +" "+orderTimeObj.hours+":"+orderTimeObj.minutes;
					resDattOrder.showCouponPrice = utils.fixPrice(resDattOrder.couponPrice);
					resDattOrder.showTotalPrice = utils.fixPrice(resDattOrder.totalPrice);
					resDattOrder.showSheepPrice = utils.fixPrice(resDattOrder.sheepPrice);
					resDattOrder.showPayPrice = utils.fixPrice(resDattOrder.payPrice);
					resDattOrder.showOrderStatus = orderService.getOrderStatusMining(resDattOrder.orderStatus).label;
					resDattOrder.skus = resDattOrder.skus.map((v,k)=>{
						v.showOriginPrice = utils.fixPrice(v.originPrice);
						return v;
					});
				}
				if(callback && typeof callback==='function'){
					callback(res);
				}
			}
		})
	}
}