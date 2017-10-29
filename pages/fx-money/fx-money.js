var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');


Page({
	onLoad:function(){
		var self = this;
		_fn.init(self);
	},
	changeTab:function(e){
		var self = this;
		//切换数据
		var extraParam = JSON.parse(e.currentTarget.dataset.extra);
		var type = extraParam.type;
		//切换tab
		var tabData = self.tab.change(e);
		self.setData({
			tab:tabData,
			type:type
		});
		self.curType = type;
		self.listMap = self.listMap || {};
		self.list = self.listMap[type]
		if(!self.list){
			self.list = _fn.createList(self,{type:type})
			self.list.next();
		}else{
			self.setData({
				members:self.list.totalData
			})
		}
	},
	scrollToLower:function(){
		var self = this;
		self.list.next();
	}
});


var _fn = {
	init:function(page){
		_fn.createTab(page);
		_fn.createList(page,{type:1});
		_fn.createList(page,{type:2});
		_fn.createList(page,{type:3});
		wx.getSystemInfo({
			success:function(res){
				var scrollHeight = res.windowHeight-60;
				page.setData({
					scrollHeight:scrollHeight

				});
			}
		});
	},
	createTab:function(page){
		page.curType = 1;//默认展示1及分销商
		page.tab = new Tab({
			offset:70,
			tabs:[{
				name:"销售",
				extra:JSON.stringify({type:1})
			},{
				name:'分成',
				extra:JSON.stringify({type:2})
			},{
				name:'提现',
				extra:JSON.stringify({type:3})
			}]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({
			tab:tabData,
			type:page.curType
		});
	},
	createList:function(page,param){
		var type = param.type || 1;
		var dataList = new List({
			url:host+'/app/order/list',
			param:{
				type:type
			},
			getList:function(res){
				// return res.data.order || [];
				// console(999)
				// res.data.order = res.data.order || [];
				// return res.data.order.concat(res.data.order).concat(res.data.order).concat(res.data.order).concat(res.data.order).concat(res.data.order);
				return [{},{},{},{},{},{}]
			},
			getHasMore:function(res){
				return res.data.hasMore;
				// return true;
			},
			render:function(res){
				if(page.curType === param.type){
					page.setData({
						members:res.totalData
					});
				}
			}
		});
		page.listMap = page.listMap || {};
		page.listMap[param.type] = dataList;
		dataList.next();
		if(page.curType === param.type){
			page.list = dataList;
		}
		return dataList;
	}
}