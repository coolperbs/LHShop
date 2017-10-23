var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');
var orderService = require('../../service/order/order');
Page({
	onLoad:function(option){
		console.log('orderList');
		var self = this;
		var status = option.status;
		self.param = {
			status :status
		}
		_fn.init(self);
	},
	changeTab:function(e){
		var self = this;
		//切换tab
		var tabData = self.tab.change(e);
		self.setData({tab:tabData});
		//切换数据
		var extraParam = JSON.parse(e.currentTarget.dataset.extra);
		var status = extraParam.type;
		self.listMap = self.listMap || {};
		self.list = self.listMap[status]
		if(!self.list){
			self.list = _fn.getListWeiget(self,{status:status})
			self.list.next();
		}else{
			self.setData({
				orderList:self.list.totalData
			})
		}
	},
	scrollToLower:function(e){
		var self = this;
		self.list.next();
	},
	toDetail:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		var eventParam = e.currentTarget.dataset.param;
		var self = this;
		self.updateParam = eventParam;
		wx.navigateTo({
			url:'../orderdetail/orderdetail?orderid='+orderId
		});
	},
	toIndexHome:function(e){
		wx.navigateTo({
			url:'../index/index'
		});

	},
	payOrder:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		orderService.pay({
			orderId:orderId,
			callback:function(res){
				console.log(res);
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
							self.updateParam = eventParam;
							_fn.updateList(self);
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
							self.updateParam = eventParam;
							_fn.updateList(self);
						}
					});
				}
			}
		});
	},
	toComment:function(e){
		var orderId = e.currentTarget.dataset.orderid;

	},
	toAftersale:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		wx.navigateTo({
			url:'../aftersale/aftersale'

		});
	}
});

var _fn = {
	init:function(page){
		if(!page.inited){
			wx.getSystemInfo({
				success:function(res){
					var scrollHeight = res.windowHeight-60;
					page.setData({
						scrollHeight:scrollHeight

					});
				}
			});
			page.param = page.param || {};
			var status = page.param.status || 1
			_fn.getTabWeiget(page);
			page.list = _fn.getListWeiget(page,{status:status});
			page.list.next();
		}else{
			_fn.updateList(page);//回退本页面时刷新数据
		}
		page.inited = true
	},
	updateList:function(page){
		var updateParam = page.updateParam;
		if(updateParam){
			var updatePage = JSON.parse(updateParam).page
			page.list.update(updatePage)
			page.updateParam = null;
		}
	},
	getTabWeiget:function(page){
		var status = page.param.status||1;
		page.tab = new Tab({
			offset:29,
			tabs:[{
				name:"全部",
				extra:JSON.stringify({type:1}),
				isSelect:status/1 === 1?true:false
			},{
				name:'待付款',
				extra:JSON.stringify({type:2}),
				isSelect:status/1 === 2?true:false
			},{
				name:'待发货',
				extra:JSON.stringify({type:3}),
				isSelect:status/1 === 3?true:false
			},{
				name:'待收货',
				extra:JSON.stringify({type:4}),
				isSelect:status/1 === 4?true:false
			},{
				name:'已完成',
				extra:JSON.stringify({type:5}),
				isSelect:status/1 === 5?true:false
			},]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({tab:tabData});

	},
	getListWeiget:function(page,param){
		var status = param.status || 1;
		var dataList = new List({
			url:host+'/app/order/list',
			param:{
				type:status
			},
			getList:function(res){
				// return res.data.order || [];
				// console(999)
				var ret = [];
				if(res.data.order && res.data.order.length>=0){
					res.data.order = res.data.order.map((v,k)=>{
						v.showPayPrice = utils.fixPrice(v.payPrice);
						v.showOrderStatus = orderService.getOrderStatusMining(v.orderStatus).label;
						if(v.skus){
							v.skus.map((vSku,kSku)=>{
								vSku.showPrice = utils.fixPrice(vSku.price);
								return vSku
							});
						}
						return v;
					});
					ret = res.data.order;
				}
				return ret;
			},
			getHasMore:function(res){
				return res.data.hasMore || false;
			},
			render:function(res){
				page.setData({
					orderList:res.totalData
				});
			}
		});
		page.listMap = page.listMap || {};
		page.listMap[param.status] = dataList;
		return dataList;
	}
}


