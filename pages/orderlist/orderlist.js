var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');
var orderService = require('../../service/order/order');
Page({
	onShow:function(){
		console.log('orderList');
		var self = this;
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
		wx.navigateTo({
			url:'../orderdetail/orderdetail?orderid='+orderId
		});
		// var eventParam = e.currentTarget.dataset.param;
		// var page = eventParam.page;
		// self.list.update(page,function(res){
		// 	self.setData({orderList:res.totalData})
		// });
	},
	toIndexHome:function(e){
		wx.navigateTo({
			url:'../index/index'
		});

	},
	delete:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		orderService.deleteOrder({
			orderId:orderId,
			callback:function(res){
				console.log('delete',res);
			}
		});

	},
	cancel:function(e){
		var orderId = e.currentTarget.dataset.orderid;
		orderService.cancelOrder({
			orderId:orderId,
			callback:function(res){
				console.log('delete',res);
			}
		});
	},
	toComment:function(e){
		var orderId = e.currentTarget.dataset.orderid;

	},
	toAftersale:function(e){
		var orderId = e.currentTarget.dataset.orderid;

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
			var fromPage = updateParam.page
			self.list.update(fromPage)
			page.updateParam = null;
		}
	},
	getTabWeiget:function(page){
		page.tab = new Tab({
			offset:29,
			tabs:[{
				name:"全部",
				extra:JSON.stringify({type:1})
			},{
				name:'待付款',
				extra:JSON.stringify({type:2})
			},{
				name:'待发货',
				extra:JSON.stringify({type:3})
			},{
				name:'待收货',
				extra:JSON.stringify({type:4})
			},{
				name:'已完成',
				extra:JSON.stringify({type:5})
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
								console.log(33);
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




	// 		<view class="sure-btn white" wx:if="{{ orderStatus == 32 || orderStatus == 256 }}" catchtap="jump" data-type="aftersale">申请售后</view>
	// <!-- 订单状态为16的订单没按钮显示，之前是显示取消订单 -->
	// <view class="sure-btn white" wx:if="{{ orderStatus == 1024 }}" catchtap="deleteOrder" data-orderid="{{orderId}}">删除订单</view>
	// <view class="sure-btn white" wx:if="{{ orderStatus == 8 }}" catchtap="cancelOrder" data-orderid="{{orderId}}">取消订单</view>
	// <view class="sure-btn" catchtap="pay"  wx:if="{{ orderStatus == 8 }}">去支付 <view class="price"><view class="sub">¥</view>{{orderInfo.payPriceStr}}</view></view>
	// <view class="sure-btn" catchtap="jump" data-type="comment" wx:if="{{ orderStatus == 256 && orderInfo.commentNum * 1 <= 0 }}">评价抢免单</view>