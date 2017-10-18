var favoriteService = require('../../service/favorite/favorite');
var cartService = require('../../service/cart/cart');
var weigetUtil = require('../../common/utils/weigetUtil');
var utils = require('../../common/utils/utils');
var config = require('../../config');
var host = config.host;
var Tab = weigetUtil.tab;
var List = weigetUtil.List;


Page({
	onShow:function(){
		var self = this;
		self.type = 'sku';
		self.weiget = {};
		_fn.init(self);
	},
	changeTab:function(e){
		var self = this;
		var tabData = self.weiget.tab.change(e);
		self.setData({tab:tabData});
		var extra = JSON.parse(e.currentTarget.dataset.extra);
		self.type = extra.type;
		if(!self.weiget.pageList[self.type]){
			self.weiget.pageList[self.type] = _fn.initPageList(self.type);
		}
		self.curPageList = self.weiget.pageList[self.type];
		self.setData({
			favList : self.curPageList.totalData,
			curType : self.type
		});

	},
	cancel:function(e){
		var self = this;
		var favoriteId = e.currentTarget.dataset.id;
		var type = e.currentTarget.dataset.type;
		var typeTxt = type==='sku'?'宝贝':'店家';
		wx.showModal({
			title:'提示',
			content:'您确定要删除这个'+typeTxt,
			success:function(res){
				if(res.confirm){
					favoriteService.cancel({
						favoriteId:favoriteId,
						callback:function(res){
							wx.showToast({
								title:'删除成功'
							});
							self.curPageList.update();
						}
					});
				}
			}
		});
	},
	toDetail:function(e){
		var type = e.currentTarget.dataset.type; 
		var id = e.currentTarget.dataset.id;
		if(type === 'shop'){
			wx.navigateTo({
				url:'../shop/shop?id='+id
			});
		}else if(type === 'sku'){
			wx.navigateTo({
				url:'../detail/detail?id='+id
			});
		}
	},
	addCart:function(e){
		var id = e.currentTarget.dataset.id;
		cartService.addOut({
			skuId:id,
			skuNum:1
		},function(res){
			if ( e.code == '1000' ) {
				wx.navigateTo( {
					url : '../login/login'
				} );
				return;
			}
			wx.showToast( { title : '添加成功!' } );
		})
	}
})

var _fn = {
	init:function(page){
		_fn.initTab(page);
		_fn.initPageList(page,'sku');
		_fn.initPageList(page,'shop');
	},
	initTab:function(page){
		page.weiget.tab = new Tab({
			offset:60,
			tabs:[{
				name:'关注的商品',
				extra:JSON.stringify({
					type:'sku'
				})
			},{
				name:'关注的商家',
				extra:JSON.stringify({
					type:'shop'
				})
			}]
		});
		var tabData = page.weiget.tab.change();
		page.setData({tab:tabData});
	},
	initPageList:function(page,type){
		// var type = page.type || 'sku';
		var url = "";
		if(type === 'sku'){
			url = host+'/app/favorite/sku/list'
		}else if(type === 'shop'){
			url = host+'/app/favorite/shop/list'
		}
		page.weiget.pageList = page.weiget.pageList || {};
		page.weiget.pageList[type] = new List({
			url:url,
			isSingle:true,
			getList:function(res){
				var listData = [];
				if(this.favType === 'sku'){
					if(res.data && res.data.skus){
						listData = res.data.skus;
						listData = listData.map((v,k)=>{
							v.showPrice = utils.fixPrice(v.originPrice);
							v.priceZS = v.showPrice.split('.')[0]+'.';//整数
							v.priceXS = v.showPrice.split('.')[1]//小数
							return v;
						})
					}
				}else if(this.favType === 'shop'){
					if(res.data && res.data.shops){
						listData = res.data.shops;
					}
				}
				return listData;
			},
			getHasMore:function(){
				return false;
			},
			render:function(res){
				var renderData = {};
				if(this.favType === 'sku'){
					renderData.skuNum = res.totalData.length;
				}else if(this.favType === 'shop'){
					renderData.shopNum = res.totalData.length;
				}
				if(page.type === this.favType){
					renderData.favList = res.totalData;
					renderData.curType = page.type;
					page.curPageList = this;
				}
				page.setData(renderData);
			}
		});
		page.weiget.pageList[type].favType = type;
		page.weiget.pageList[type].next();
	}
}