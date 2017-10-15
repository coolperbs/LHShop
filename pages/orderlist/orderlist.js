var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
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
		console.log(tabData);
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
				return res.data.order || [];
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