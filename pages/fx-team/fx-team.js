var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');
var app = getApp();
var ajax = require('../../common/ajax/ajax');


Page({
	onShareAppMessage : app.shareFunc,
	onLoad:function(){
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
		var type = extraParam.type;
		self.curType = type;
		self.listMap = self.listMap || {};
		self.list = self.listMap[type]
		if(!self.list){
			// self.list = _fn.createList(self,{type:type})
			// self.list.next();
		}else{
			self.setData({
				members:self.list
			})
		}
	},
	scrollToLower:function(){
		// var self = this;
		// self.list.next();
	}
});


var _fn = {
	init:function(page){
		page.curType = 1;//默认展示1及分销商
		_fn.createTab(page);
		// _fn.createList(page,{type:1});
		// _fn.createList(page,{type:2});
		_fn.getPageData(page);
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
		page.tab = new Tab({
			offset:90,
			tabs:[{
				name:"一级分销商",
				extra:JSON.stringify({type:1})
			},{
				name:'二级分销商',
				extra:JSON.stringify({type:2})
			}]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({tab:tabData});

	},
	getPageData:function(page){
		ajax.query({
			url:host+'/app/money/user/list'
		},function(res){
			// console.log(res);
			if(res.code==='0000'){
				page.listMap = page.listMap || {};


				res.data.firstUsers.map((v,k)=>{
					v.showCreated = utils.formateTime(v.created);
					return v
				})
				res.data.secondUsers.map((v,k)=>{
					v.showCreated = utils.formateTime(v.created);
					return v
				})
				page.listMap[1] = res.data.firstUsers;
				page.listMap[2] = res.data.secondUsers;
				page.setData({
					members:page.listMap[1],
					firstTotal:page.listMap[1].length,
					secondTotal:page.listMap[2].length
				})
			}

		})

	}
	// createList:function(page,param){
	// 	var type = param.type || 1;
	// 	var dataList = new List({
	// 		url:host+'/app/order/list',
	// 		param:{
	// 			type:type
	// 		},
	// 		getList:function(res){
	// 			// return res.data.order || [];
	// 			// console(999)
	// 			res.data.order = res.data.order || [];
	// 			return res.data.order.concat(res.data.order).concat(res.data.order).concat(res.data.order).concat(res.data.order).concat(res.data.order);
	// 		},
	// 		getHasMore:function(res){
	// 			return res.data.hasMore;
	// 			// return true;
	// 		},
	// 		render:function(res){
	// 			if(page.curType === param.type){
	// 				page.setData({
	// 					members:res.totalData
	// 				});
	// 			}
	// 		}
	// 	});
	// 	page.listMap = page.listMap || {};
	// 	page.listMap[param.type] = dataList;
	// 	dataList.next();
	// 	if(page.curType === param.type){
	// 		page.list = dataList;
	// 	}
	// 	return dataList;
	// }
}