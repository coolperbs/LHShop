var weigetUtil = require('../../common/utils/weigetUtil');
var aftersaleService = require('../../service/aftersale/aftersale');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');
var app = getApp();


Page({
	onShareAppMessage : app.shareFunc,
	onLoad:function(option){
		var self = this;
		var skuId = option.skuid||1;
		self.param ={
			skuId : skuId
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
		var type = extraParam.type;
		self.listMap = self.listMap || {};
		self.list = self.listMap[type]
		if(!self.list){
			self.list = _fn.createList(self,{type:type})
			self.list.next();
		}else{
			self.setData({
				aftersaleList:self.list.totalData
			});
		}
	},
	scrollToLower:function(e){
		var self = this;
		self.list.next();
	},
	toDetail:function(e){
		var self = this;
		var aftersaleId = e.currentTarget.dataset.id;
		var selItem = this.data.aftersaleList.filter((v,k)=>{
			return v.id = aftersaleId;
		})[0]
		aftersaleService.cache(selItem);
		wx.navigateTo({
			url:'../aftersale/aftersale?aftersaleId='+aftersaleId
		})
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
			_fn.createTab(page);
			page.list = _fn.createList(page,{type:""});
			page.list.next();
		}else{
			_fn.updateList(page);//回退本页面时刷新数据
		}
		page.inited = true

	},
	createTab:function(page){
		page.tab = new Tab({
			offset:29,
			tabs:[{
				name:"全部",
				extra:JSON.stringify({type:""}),
			},{
				name:'处理中',
				extra:JSON.stringify({type:1}),
			},{
				name:'已完成',
				extra:JSON.stringify({type:2}),
			},{
				name:'被驳回',
				extra:JSON.stringify({type:4}),
			},{
				name:'已取消',
				extra:JSON.stringify({type:3}),
			},]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({tab:tabData});


	},
	createList:function(page,param){
		var type = param.type;
		var skuId = page.param.skuId;
		var reqParam = {};
		reqParam.skuId = skuId;
		if(type===1){
			reqParam.stat = 1;
		}else if(type===2){
			reqParam.stat = 2;
		}else if(type===3){
			reqParam.stat = 3;
		}else if(type===4){
			reqParam.stat = 4
		}

		var dataList = new List({
			url:host+'/app/aftersale/list',
			param:reqParam,
			getList:function(res){
				if(res.data && res.data.aftersales){
					res.data.aftersales = res.data.aftersales || [];
					res.data.aftersales = res.data.aftersales.map((v,k)=>{
						// console.log(v);
						v.aftersale = v.aftersale || {};
						v.ware = v.ware || {};
						v.aftersale.showCreated = utils.formateTime(v.aftersale.created);
						v.ware.showPrice = utils.fixPrice(v.ware.price);
						return v;
					});
				}
				return res.data.aftersales;
			},
			getHasMore:function(res){
				return res.hasMore;
			},
			render:function(res){
				page.setData({
					aftersaleList:res.totalData
				})
			}
		});
		page.listMap = page.listMap || {};
		page.listMap[param.type] = dataList;
		return dataList;
	}

}