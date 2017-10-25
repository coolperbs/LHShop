var weigetUtils = require('../../common/utils/weigetUtil');
var utils = require('../../common/utils/utils');
// var DropMenu = weigetUtils.DropMenu;
var List = weigetUtils.List;
var config = require('../../config');
var host = config.host;
Page({
	onLoad:function(){
		var self = this;
		_fn.init(self);
	},
	changeSort:function(e){
		var self = this;
		var sortMenuData = self.sortMenu.change(e);
		self.setData({
			sortMenuData:sortMenuData
		});
		_fn.search(self);
	},
	changeInput:function(e){
		var value = e.detail.value;
		var self =this;
		self.data.title = value;
		_fn.search(self);
	},
	getNext:function(){
		var self=this;
		self.setData({
			isLoading:true
		})
		self.dataList.next()
	}
});

var _fn = {
	init:function(page){
		wx.getSystemInfo({
			success:function(res){
				console.log(res);
				page.setData({
					height:(utils.toRpx(res.screenHeight)-204)+'rpx'
				});
			}
		});
		_fn.initSortWeiget(page);
		_fn.search(page);
	},
	initSortWeiget:function(page){
		page.sortMenu = new SortMenu({
			data:[
				{text:'销量',key:'saleSort'},
				{text:'价格',key:'priceSort'},
				{text:'日期',key:'publishSort'}
			]
		});
		var sortMenuData = page.sortMenu.change();
		page.setData({
			sortMenuData:sortMenuData
		});
	},
	search:function(page){
		var searchParam = _fn.getSearchParam(page);
		page.dataList = page.dataList || new List();
		page.dataList.setConfig({
			url:host+'/app/ware/search',
			param:searchParam,
			render:function(data){
				data.totalData = data.totalData.map((v,k)=>{
					v.showPrice = utils.fixPrice(v.price);
					v.showOriginPrice = utils.fixPrice(v.price);
					return v;
				});
				console.log(11,data);
				page.setData({
					searchRes:data,
					isLoading:false
				})
			},
			getList:function(res){
				return res.data.wareSkus;
			},
			getHasMore:function(res){
				return res.data.hasMore;
			}
		});
		page.dataList.next();
	},
	getSearchParam:function(page){
		page.param = page.param || {};
		return {
			catId:page.param.catId,
			shopId:page.param.shopId,
			title:page.data.title,
			citycode:wx.getStorageSync('city').code,//
			publishSort:page.data.sortMenuData.sortData.publishSort,
			priceSort:page.data.sortMenuData.sortData.priceSort,
			saleSort:page.data.sortMenuData.sortData.saleSort
		};
	}
}



class SortMenu{
	constructor(props) {
	  this.data = props.data;
	  this.statusList = [null,1,2];//null:默认,1升序，2降序
	  this.reset();
	}
	change(e){
		if(e){
			var param = e.currentTarget.dataset.param;
			param = JSON.parse(param)||{};
			var index = param.index;
			if(index||index==0){
				var self = this;
				var menus = self.renderData.menu;
				var sortData = self.renderData.sortData;
				menus = menus.map((v,k)=>{
					if(v.index === index){
						var curStatus = v.status;
						var curIdx = self.statusList.indexOf(curStatus);
						var nextIdx = curIdx+1<self.statusList.length?curIdx+1:0;
						var nextStatus = self.statusList[nextIdx];
						v.status = nextStatus;

						sortData[v.key] = nextStatus
					}
					return v;
				});
			}
		}
		return this.renderData;
	}
	reset(){
		var self = this;
		self.renderData = {menu:[],sortData:{}};
		this.data.forEach((v,k)=>{
			self.renderData.menu.push({
				text:v.text,
				key:v.key,
				status:self.statusList[0],//默认
				index:k,
				eventParam:JSON.stringify({
					index:k
				})
			});
			self.renderData.sortData[v.key] = self.statusList[0];
		});
	}
}