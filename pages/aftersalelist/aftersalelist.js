var service =  require( '../../service/service' ),
	aftersale = service.aftersale;
Page({
	data:{},
	onLoad:function(options){
		var self = this;
		var orderId = options.orderid;
		self.setData({
			orderId:orderId
		});
	},
	onShow:function(){
		var self = this;
		_fn.getOrderGoods(self);
		_fn.getReason();
	},
	toAfterSaleDetail:function(event){
		// var id = event.currentTarget.dataset.id;
		var self = this;
		var skuId = event.currentTarget.dataset.skuid;
		var currentWares = self.data.currentWares;
		currentWares.filter(function(v,k){
			return v.skuId === skuId;
		});
		var orderId = self.data.orderId;
		var skuId = skuId;
		var maxNum = currentWares[0].remainNum;
		var price = currentWares[0].refundPrice;
		var wareName = currentWares[0].wareName;
		var paramStr= "orderId="+orderId+
					"&skuId="+skuId+
					"&maxNum="+maxNum+
					"&price="+price+
					"&wareName="+wareName;

		wx.navigateTo({
			url:'../aftersale/aftersale?'+paramStr
		});
	},
	chnageTab:function(event){
		var self = this;
		var key = event.currentTarget.dataset.key;
		var unitWares = self.data.unitWares;
		var newCurWares = unitWares[key];
		// console.log(newCurWares);
		self.setData({
			currentWares:newCurWares,
			currentTab:key
		});
	}
});
var _fn = {
	getOrderGoods:function(caller){
		var orderId = caller.data.orderId;
		aftersale.getOrderAftersales({
			orderId:orderId
		},function(res){
			// console.log(res);
			// var wares = res.data.rsWareVOList;
			// var unitWares = {};
			// var units = [];
			// wares.forEach(function(v,k){
			// 	var wareTab = v.unitCode+v.unitName
			// 	if(!unitWares[wareTab]){
			// 		unitWares[wareTab] = [];
			// 		units.push(wareTab);
			// 	}
			// 	v.showPromotionPrice = (v.promotionSinglePrice/100).toFixed(2);
			// 	v.showWarePrice = (v.warePrice/100).toFixed(2);
			// 	v.showRefundPricePrice = (v.refundPrice/100).toFixed(2);
			// 	unitWares[wareTab].push(v);
			// });
			// caller.setData({
			// 	unitWares:unitWares,
			// 	units:units,
			// 	currentTab:units[0],
			// 	currentWares:unitWares[units[0]]
			// });
			var wares = res.data.rsWareVOList;
			wares = wares.map(function(v,k){
				v.showPromotionPrice = (v.promotionSinglePrice/100).toFixed(2);
				v.showWarePrice = (v.warePrice/100).toFixed(2);
				v.showRefundPricePrice = (v.refundPrice/100).toFixed(2);
				return v;
			});
			caller.setData({
				currentWares:wares
			});


		});
	},
	getReason:function(caller,param){
		aftersale.getReasons({},function(res){
			
		});
	}
}