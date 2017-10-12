var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
Page({
	onShow:function(){
		console.log('orderList');
		var self = this;
		_fn.init(self);
	},
	changeTab:function(e){
		var self = this;
		var tabData = self.tab.change(e);
		self.setData({tab:tabData});

	},
	scrollToLower:function(e){
		console.log(333);
		var self = this;
		self.list.next();

	}
});

var _fn = {
	init:function(page){
		// console.log(weigetUtils);
		wx.getSystemInfo({
			success:function(res){
				var scrollHeight = res.windowHeight-60;
				page.setData({
					scrollHeight:scrollHeight

				});
			}
		});
		var weiget = page.weiget = page.weiget || {};
		var allList = new List({//全部订单
			url:'http://47.92.75.170:9000/mch/order/list',
			param:{
				param:{},
				token:'B9E790B21A34C5AEE7FD72312ED287BF65755F9A7C7B1B1A1312846CF80941B1CFAA7EAF50D0AAE1792F587AB28B9E1116B8BEF7203F60F64C59420F607E3AB7907BF97398BDD7846D4E5864883DFABC5504706E8E5941EDEDEA61C1E300E3CB24DA23AB61D8209406B4BA5ECDE1591F68E721CD31577FD6354F98E7CB5471D1'
			},
			render:function(listData){
				page.setData({
					listData:listData
				});
			}
		});
		var waitingPayList = new List({//待付款
			url:'orderList',
			param:{
				status:'waitingPay'
			}
		});
		var waitingSendList = new List({//代发货
			url:'orderList',
			param:{
				status:'waitingSend'
			}
		});
		var waitingReciveList = new List({//待收货
			url:'orderList',
			param:{
				status:'waitingRecive'
			}
		});
		var aftersaleList = new List({//售后
			url:'orderList',
			param:{
				status:'waitingAfterSale'
			}
		});
		page.tab = new Tab({
			offset:29,
			tabs:[{
				name:"全部",
				data:allList

			},{
				name:'待付款',
				data:waitingPayList

			},{
				name:'待发货',
				data:waitingReciveList

			},{
				name:'待收货',
				data:waitingReciveList

			},{
				name:'售后',
				data:aftersaleList

			},]
		});
		var tabData = page.tab.change();
		page.setData({
			tab:tabData
		});
		page.list = tabData.curData;
		page.list.next();



	}
}