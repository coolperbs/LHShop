var weigetUtil = require('../../common/utils/weigetUtil');
var Tab = weigetUtil.tab;
var List = weigetUtil.List;
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');
var ajax = require('../../common/ajax/ajax');



var applyStatusEnum = {
	1:'审核中',
	2:'已完成'
}
var applyTypeEnum = {
	1:'银行卡',
	2:'微信',
	3:'支付宝'
}


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
			var showList = [];
			if(self.curType==='moneyapply'){
				showList = self.list.totalData
			}else{
				showList = self.list;
			}
			self.setData({
				members:showList
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
		_fn.createMoneyApply(page);
		_fn.createMoneyInfo(page);
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
		page.curType = 'sale';//默认展示1及分销商
		page.tab = new Tab({
			offset:70,
			tabs:[{
				name:"销售",
				extra:JSON.stringify({type:'sale'})
			},{
				name:'分成',
				extra:JSON.stringify({type:'get'})
			},{
				name:'提现',
				extra:JSON.stringify({type:'moneyapply'})
			}]
		});
		var tabData = page.tab.change();
		// console.log(tabData);
		page.setData({
			tab:tabData,
			type:page.curType
		});
	},
	createMoneyApply:function(page){
		var listType = "moneyapply";
		var dataList = new List({
			url:host+'/app/money/apply/list',
			getList:function(res){
				// return res.data.order || [];
				// console(999)
				// res.data.order = res.data.order || [];
				// return res.data.order.concat(res.data.order).concat(res.data.order).concat(res.data.order).concat(res.data.order).concat(res.data.order);
				// return [{},{},{},{},{},{}]
				// console.log(res,222);
				var retList = res.data.moneyApplys;
				retList.map((v,k)=>{
					v.showApplyStatus = applyStatusEnum[v.status]
					v.showType = applyTypeEnum[v.type]
					v.showCreated = utils.formateTime(v.created);
					v.showPrice = utils.fixPrice(v.price);
					v.showCardNum = v.carnum[0]+'***'+v.carnum[v.carnum.length-1];
				})
				return retList;
			},
			getHasMore:function(res){
				return res.data.hasMore;
				// return true;
			},
			render:function(res){
				if(page.curType === listType){
					page.setData({
						records:res.totalData
					});
				}
			}
		});
		page.listMap = page.listMap || {};
		page.listMap[listType] = dataList;
		dataList.next();
		if(page.curType === listType){
			page.list = dataList;
		}
		return dataList;

	},
	createMoneyInfo:function(page){
		var curPageType = page.curType;
		ajax.query({
			url:host+'/app/money/info'
		},function(res){
			console.log(res);
			var resData = res.data;
			if(!resData){
				return;
			}
			page.listMap = page.listMap || {};
			resData.firstSale = resData.firstSale || 0;
			resData.secondSale  = resData.secondSale || 0;
			resData.thirdSale = resData.thirdSale || 0;
			resData.firstGet = resData.firstGet || 0;
			resData.secondGet = resData.secondGet || 0;
			resData.thirdGet = resData.thirdGet || 0;


			page.listMap.sale = [];
			page.listMap.sale.push({price:utils.fixPrice(resData.firstSale),level:1})
			page.listMap.sale.push({price:utils.fixPrice(resData.secondSale),level:2})
			page.listMap.sale.push({price:utils.fixPrice(resData.thirdSale),level:3});
			page.listMap.get = [];
			page.listMap.get.push({price:utils.fixPrice(resData.firstGet),level:1})
			page.listMap.get.push({price:utils.fixPrice(resData.secondGet),level:2})
			page.listMap.get.push({price:utils.fixPrice(resData.thirdGet),level:3});
			if(curPageType === 'sale' || curPageType === 'get'){
				page.list = page.listMap[curPageType];
				page.setData({
					members:page.listMap[curPageType],
					saleTotal:utils.fixPrice(resData.firstSale + resData.thirdSale +resData.secondSale),
					getTotal:utils.fixPrice(resData.firstGet + resData.secondGet + resData.thirdGet)
				})
			}
		})
	}
}