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
	}
});
var _fn = {
	init:function(page){
		_fn.getData(page,function(res){
			if(res.code === '0000'){
				var resData = res.data;
				var resDattOrder = resData.order;
				var orderTimeObj = utils.timeToDateObj(resDattOrder.orderTime)

				resDattOrder.showOrderTime = orderTimeObj.year +'-'+ orderTimeObj.month +"-"+ orderTimeObj.day +" "+orderTimeObj.hours+":"+orderTimeObj.minutes;
				resDattOrder.showTotalPrice = utils.fixPrice(resDattOrder.totalPrice);
				resDattOrder.showPayPrice = utils.fixPrice(resDattOrder.payPrice);
				resDattOrder.skus = resDattOrder.skus.map((v,k)=>{
					v.showOriginPrice = utils.fixPrice(v.originPrice);
					return v;
				});
				page.setData({
					detail:resData
				});
			}

		});
	},
	getData:function(page,callback){
		var orderId = page.param.orderid;
		orderService.getOrderDetail({
			orderId:orderId,
			callback:callback
		})
	}
}