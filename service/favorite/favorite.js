var config = require('../../config');
var utils = require('../../common/utils/utils');
var ajax = require('../../common/ajax/ajax');
var host = config.host;
var handle = {
	addSku:function(param){
		var skuId = param.skuId;
		var callback = param.callback;

		var type = 1;//1收藏商品 2 收藏店铺 
		var status = 1;//1收藏，2取消收藏
		ajax.query({
			url:host+'/app/favorite',
			param:{
				skuId:skuId,
				type:type,
				status:status
			}
		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})
	},
	addShop:function(param){
		var shopId = param.shopId;
		var callback = param.callback;

		var type = 2; //1收藏商品 2 收藏店铺 
		var status = 2;//1收藏，2取消收藏
		ajax.query({
			url:host+'/app/favorite',
			param:{
				shopId:shopId,
				type:type,
				status:status
			}
		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})
	},
	getSku:function(param){
		var callback = param.callback;
		ajax.query({
			url:host+'/app/favorite/sku/list'
		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})

	},
	getShop:function(param){
		var callback = param.callback;
		ajax.query({
			url:host+'/app/favorite/shop/list'
		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})
	},
	cancel:function(param){
		var favoriteId = param.favoriteId;
		var callback = param.callback;
		var type = 2;
		var status = 2;//1收藏，2取消收藏

		ajax.query({
			url:host+'/app/favorite',
			param:{
				favoriteId:favoriteId,
				// type:type,
				// status:status
			}
		},function(res){
			if(callback && typeof callback === 'function'){
				callback(res);
			}
		})


	}
	
}


module.exports = handle;