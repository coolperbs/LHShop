var utils = require( '../../common/utils/utils' );
var us = require('../../lib/underscore');
var orderService = require('../../service/order/order');
var service = require('../../service/service');
var app = getApp();
var dataHandler;//添加修改数据
var orderScorllInfo={};


var events = {
	mineCallPhone : function( e ) {
	},
	goLogin:function(){
		utils.navigateTo( { url : '../login/login' } );
	},
	toLogin:function(event){
		utils.navigateTo({
			url:'../login/login'

		});
	},
	toOrderDetail:function(event){
		var orderId = event.currentTarget.dataset.orderid;
		var pageNo = event.currentTarget.dataset.pageno;
		dataHandler.setData({
			updateId:orderId,
			updatePageNo:pageNo
		});
		utils.navigateTo({
			url:"../orderdetail/orderdetail?orderid="+orderId
		});
	},
	afterSaleOrder:function(event){
		var orderId = event.currentTarget.dataset.orderid;
		var pageNo = event.currentTarget.dataset.pageno;
		dataHandler.setData({
			updateId:orderId,
			updatePageNo:pageNo
		});
		utils.navigateTo({
			url:"../aftersalelist/aftersalelist?orderId="+orderId
		});
	},
	scrollToLower:function(){
		let isDataLoading = dataHandler.getData().dataLoading;
		let isLastPage = dataHandler.getData().isLastPage;
		if(isDataLoading||isLastPage){
			return;
		}else{
			let currentPage = dataHandler.getData().currentPage/1+1;
			dataHandler.setData({
				currentPage:currentPage
			});
			_fn.reqOrderData(res=>{
					var newOrderList = res.data.result;
					_fn.addOrders(newOrderList);
					if(res.data.lastPage){
						dataHandler.setData({
							isLastPage:true
						});
					}
			});
		} 
	},
	commentOrder:function(event){
		var orderId = event.currentTarget.dataset.orderid;
		var pageNo = event.currentTarget.dataset.pageno;
		dataHandler.setData({
			updateId:orderId,
			updatePageNo:pageNo
		});
		utils.navigateTo({
			url:"../comment/comment?orderId="+orderId
		});
	},
	cancelOrder:function(event){
		var orderId = event.currentTarget.dataset.orderid;
		var pageNo = event.currentTarget.dataset.pageno;
		dataHandler.setData({
			updateId:orderId,
			updatePageNo:pageNo
		});
		var self = this;
		wx.showModal({
			title:'提示',
			content:'您确认要取消该笔订单么?',
			success:function(res){
				if(res.confirm){
					_fn.cancelOrder(orderId)
					
				}
			}
		});
	},
	deleteOrder:function(event){
		var orderId = event.currentTarget.dataset.orderid;
		var pageNo = event.currentTarget.dataset.pageno;
		dataHandler.setData({
			updateId:orderId,
			updatePageNo:pageNo
		});
		wx.showModal({
			title:'提示',
			content:'您确认要删除该笔订单么?',
			success:function(res){
				if(res.confirm){
					_fn.delOrder(orderId)
				}
			}
		});
	},
	payOrder:function(event){
		var orderId = event.currentTarget.dataset.orderid;
		var payPrice = event.currentTarget.dataset.price;
		var pageNo = event.currentTarget.dataset.pageno;
		dataHandler.setData({
			updateId:orderId,
			updatePageNo:pageNo
		});
		_fn.payOrder(orderId,payPrice);
		
	},
	pageScroll:function(event){
		if(dataHandler.getData().direction === 'left'){
			var orders = dataHandler.getData().orderList;
			var newOrders = orders.map((v,k)=>{
				v.position = 'right';
				return v
			});
			dataHandler.setData({
				startX:0,
				startY:0,
				orderList:newOrders
			});
		}
	},
	startOrderScroll:function(event){
		var orderStatus = event.currentTarget.dataset.orderstatus/1;
		if(orderStatus===256 || orderStatus===512 || orderStatus===1024){
			var curX = event.changedTouches[0].pageX||0;
			var curY = event.changedTouches[0].pageY||0;
			dataHandler.setData({
				startX:curX,
				startY:curY
			});
		}
	},
	stopOrderScroll:function(event){
		var orderStatus = event.currentTarget.dataset.orderstatus/1;
		if(orderStatus===256 || orderStatus===512 || orderStatus===1024){
			var startX = dataHandler.getData().startX;
			var startY = dataHandler.getData().startY;

			var curY = event.changedTouches[0].pageY||0;
			var curX = event.changedTouches[0].pageX||0;

			if(Math.abs(startX-curX)<50 || Math.abs(startY-curY)>150){//重置，不滑动
				dataHandler.setData({
					startX:0,
					startY:0,
				});
			}else{
				var orderId = event.currentTarget.dataset.orderid;
				var orders = dataHandler.getData().orderList;
				var direction = startX - curX >0?'left':'right'
				var newOrders = orders.map((v,k)=>{
					if(v.id === orderId){
						v.position = direction;
					}else{
						v.position = 'right';
					}
					return v
				});
				dataHandler.setData({
					startX:0,
					startY:0,
					direction:direction,
					orderList:orders
				})

			}
		}
	}
}
var DataHandler = function(callerPage){
	this.callerPage = callerPage;
	this.orderData = {};
	this.setData = function(data){
		var isCurrentPage = this.callerPage.data.currentView == 'orders';
		if(!isCurrentPage){
			return;
		}
		var orderData = us.extend(this.orderData,data);
		this.callerPage.setData({
			viewData:{
				orders:orderData
			}
		});
	};
	this.getData = function(){
		return this.orderData;
	};
	this.clearData = function(){
		this.orderData = {};
		this.callerPage.setData({
			viewData:{
				orders:{}
			}
		});
	}
}
var _fn = {
	init : function( callerPage ) {
		if ( callerPage.initedOrders ) {
			dataHandler.clearData();
			return;
		}
		callerPage.setData({
  			currentView : 'orders'
  		});
		utils.mix( callerPage, events );
		dataHandler = new DataHandler(callerPage);
		// callerPage.initedMine = true;
	},
	render : function(callerPage){
		dataHandler.setData({
			currentPage:1
		});
		_fn.initScorllArea();
		_fn.reqOrderData(res=>{
			if(res.login===false){
				dataHandler.setData({
					needLogin:true
				});
			}else{
				var newOrderList = res.data.result;
				_fn.addOrders(newOrderList);
				if(res.data.lastPage){
					dataHandler.setData({
						isLastPage:true
					});
				}
			}
		});	
	},
	// updateOrder:function(orderId){
	// 	if(!orderId){
	// 		return;
	// 	}
	// 	orderService.getOrderDetail({//更新订单状态
	// 		id:orderId
	// 	},function(res){
	// 		if(res.code==='0000'&&res.success===true){
	// 			var orderList = dataHandler.getData()['orderList'];
	// 			var orderInfo = res.data;
	// 			var newOrderList = orderList.map((v,k)=>{
	// 				if(v.id === orderId){
	// 					v.id = orderInfo.id;
	// 					v.orderStatus = orderInfo.orderStatus;
	// 					v.statusInfo = orderService.getOrderStatusMining(orderInfo.orderStatus);
	// 					v.statusStr = orderInfo.statusStr;
	// 					v.commentNum = orderInfo.commentNum;
	// 				}
	// 				return v;
	// 			});
	// 			dataHandler.setData({
	// 				orderList:newOrderList
	// 			});
	// 		}else{
	// 			wx.showToast({
	// 				title:"更新订单状态失败"
	// 			});
	// 			console.error("更新订单状态失败",res.msg);
	// 		}
	// 	});
	// },
	refreshData:function(){
		var curPage = dataHandler.getData().currentPage/1;
		var updateOrderPage = dataHandler.getData().updatePageNo/1;
		var pageOrders = {};
		var maxCount = curPage - updateOrderPage + 1;
		for(var i = updateOrderPage ; i <=curPage ; i++ ){
			_fn.reqPageOrderData(i,function(res){
				maxCount--
				if(res && res.data && res.data.result){
					var newOrderList = res.data.result;
					var pageNo = newOrderList[0].pageNo;
					pageOrders[pageNo] = newOrderList;
				}
				if(maxCount===0){//所有请求回来才走更新
					_fn.replacePageOrders(pageOrders);
					dataHandler.setData({
						updateId:null,
						updatePageNo:null
					});
				}
			});
		}
	},
	replacePageOrders:function(pageOrders){
		var currentPage = dataHandler.getData().currentPage;
		if(!pageOrders){
			return;
		}
		var curOrdersList = dataHandler.getData().orderList;
		console.log(1,curOrdersList.length);
		var orderMap = {};
		var lastPageNo;
		curOrdersList.forEach(function(v,k){
			orderMap[v.pageNo] = orderMap[v.pageNo] || [];
			orderMap[v.pageNo].push(v);
		});
		for(var i in pageOrders){
			orderMap[i] = pageOrders[i];
		}
		var newOrderList = []
		for(var i = 1 ; i <= currentPage ; i++){
			newOrderList = newOrderList.concat(orderMap[i]);
		}
		console.log(2,newOrderList.length);
		dataHandler.setData({
			orderList:newOrderList
		})
		// console.log(2,newOrderList.length);
	},
	addOrders:function(newOrderList){
		var orderList = dataHandler.getData().orderList||[];
		var pageNo = dataHandler.getData().currentPage;
		if(newOrderList && newOrderList.length>0){
			newOrderList = newOrderList.map((v,k)=>{
				// v.showPayPrice = (v.payPrice/100).toFixed(2);
				// v.showWarePrice = (v.waresPrice/100).toFixed(2);
				// v.pageNo = pageNo
				return v;
			});
		}
		newOrderList = orderList.concat(newOrderList);
		dataHandler.setData({
			orderList:newOrderList
		});
	},
	reqPageOrderData:function(pageNo,callback){
		dataHandler.setData({dataLoading:true});
		var currentPage = pageNo;
		// utils.showLoading();
		orderService.getOrderList({
			currentPage:currentPage
		},res=>{
			// utils.hideLoading();
			if(res.code === '0000'){
				var renderOrderList = [];
				res.data.result = res.data.result || [];
				res.data.result.map((v,k)=>{
					v.statusInfo = orderService.getOrderStatusMining(v.orderStatus);
					v.showPayPrice = (v.payPrice/100).toFixed(2);
					v.showWarePrice = (v.waresPrice/100).toFixed(2);
					v.pageNo = pageNo
					return v;
				});
				if(typeof callback === 'function'){
					callback(res);
				}
			}else if(res.code === 'GW1005'){
				callback({login:false});
			}else{
				callback(res);
				console.error('reqOrderData error',res.msg,res.code);
			}
			dataHandler.setData({dataLoading:false});
		});
	},
	reqOrderData:function(callback){
		dataHandler.setData({dataLoading:true});
		var currentPage = dataHandler.getData().currentPage;
		// utils.showLoading();
		orderService.getOrderList({
			currentPage:currentPage
		},res=>{
			// utils.hideLoading();
			if(res.code === '0000'){
				var renderOrderList = [];
				res.data.result = res.data.result || [];
				res.data.result.map((v,k)=>{
					v.statusInfo = orderService.getOrderStatusMining(v.orderStatus);
					v.showPayPrice = (v.payPrice/100).toFixed(2);
					v.showWarePrice = (v.waresPrice/100).toFixed(2);
					v.pageNo = currentPage;
					return v;
				});
				if(typeof callback === 'function'){
					callback(res);
				}
			}else if(res.code === 'GW1005'){
				callback({login:false});
			}else{
				console.error('reqOrderData error',res.msg,res.code);
			}
			dataHandler.setData({dataLoading:false});
		});
	},
	initScorllArea:function(){
		wx.getSystemInfo({
			success:res=>{
				let windowHeight = res.windowHeight;
				let scrollHeight =( windowHeight-50)
				dataHandler.setData({scrollHeight:scrollHeight});
			},
			fail:res=>{
				let scrollHeight ='550';//如果拿不到systeminfo，就只兼容iphone6
				dataHandler.setData({scrollHeight:scrollHeight});
			}
		});

	},
	cancelOrder:function(orderId){
		orderService.cancelOrder({
			orderId:orderId
		},res=>{
			var toastMsg = "取消失败";
			if(res.code==='0000' || res.success===true){
				toastMsg = "取消成功";
				_fn.refreshData(orderId)
			}
			wx.showToast({
				title:toastMsg
			});
		});
	},
	delOrder:function(orderId){
		orderService.delOrder({
			id:orderId
		},res=>{
			var toastMsg = "删除失败";
			if(res.code==="0000"&&res.success===true){
				toastMsg = "删除成功";
				// _fn.refreshData(orderId);
				_fn.removeOrderRecord(orderId);
				setTimeout(function(){
					_fn.refreshData()
				},1500)
			}
			wx.showToast({
				title:toastMsg
			});
		});
	},
	removeOrderRecord:function(orderId){
		var orderList = dataHandler.getData()['orderList'];
		var newOrderList = orderList.map((v,k)=>{
			if(v.id === orderId){
				v.recordPos = "h-hiden"//横向隐藏
			}
			return v;
		});
		dataHandler.setData({
			orderList:orderList
		});
		setTimeout(function(){
			var newOrderList = orderList.map((v,k)=>{
				if(v.id === orderId){
					v.recordPos = "v-hiden"//纵向隐藏
				}
				return v;
			});
			dataHandler.setData({
				orderList:orderList
			});
		},500)
	},
	payOrder:function(orderId,payPrcie){
		service.trade.pay( {//请求支付数据
			orderId : orderId,
			autoPay : false,
			totalFee : payPrcie
		}, function( payRes ) {
			var data;
			if ( !payRes || payRes.code != '0000' ) {
				wx.showToast( { title : payRes.msg } );
				return;
			}
			data = payRes.data || {};
			service.trade.wxPay( {// 3.唤醒微信支付
				timeStamp : data.timeStamp,
				nonceStr : data.nonce_str,
				package : 'prepay_id=' + data.prepay_id,
				signType : 'MD5',
				paySign : data.sign					
			}, function( wxRes ) {
				if ( !wxRes || wxRes.code != '0000' ) {
					wx.showToast( { title : wxRes.msg } );
					return;
				}
				wx.showToast( { title : '支付成功' } );
				_fn.refreshData(orderId);

			} );
		} );
	}
}


var handle = {
  render : function( callerPage ) {
  	if(dataHandler && dataHandler.getData().updateId){
  		var orderId = dataHandler.getData().updateId;
  		_fn.refreshData(orderId);
  		dataHandler.setData({
  			updateId:null
  		});
  	}else{
	  	_fn.init( callerPage );
	  	_fn.render();
	  	callerPage.initedOrders = true;
  	}
  }
};
module.exports = handle;