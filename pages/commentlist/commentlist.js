var weigetUtil = require('../../common/utils/weigetUtil');
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
				commentList:self.list.totalData
			})
		}
	},
	scrollToLower:function(e){
		var self = this;
		self.list.next();
	},

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
			page.list = _fn.createList(page,{type:1});
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
				extra:JSON.stringify({type:1}),
			},{
				name:'好评',
				extra:JSON.stringify({type:2}),
			},{
				name:'中评',
				extra:JSON.stringify({type:3}),
			},{
				name:'差评',
				extra:JSON.stringify({type:4}),
			},{
				name:'我的',
				extra:JSON.stringify({type:5}),
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
		if(type===2){
			reqParam.level = 1;
		}else if(type===3){
			reqParam.level = 2;
		}else if(type===4){
			reqParam.level = 3;
		}else if(type===5){
			reqParam.querySelf = 1
		}

		var dataList = new List({
			url:host+'/app/comment/list',
			param:reqParam,
			getList:function(res){
				if(res.data && res.data.comments){
					res.data.comments = res.data.comments || [];
					res.data.comments = res.data.comments.map((v,k)=>{
						var timeObj = utils.timeToDateObj(v.commentCreated);
						v.showCreateTime = timeObj.year+'-'+timeObj.month+"-"+timeObj.day
						v.files = [];
						for(var i = 1 ; i<=9 ; i++){
							if(v['img'+i]){
								v.files.push(v['img'+i])	
							}
						}
						return v;
					});
				}
				return res.data.comments;
			},
			getHasMore:function(res){
				return res.hasMore;
			},
			render:function(res){
				page.setData({
					commentList:res.totalData
				})
			}
		});
		page.listMap = page.listMap || {};
		page.listMap[param.status] = dataList;
		return dataList;
	}

}