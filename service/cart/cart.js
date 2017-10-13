var ajax = require('../../common/ajax/ajax'), 
	app = getApp(),
	url, CFG, _fn, handle;


url = {
	add : app.host + '/app/cart/add',
	query : app.host + '/app/cart/list',
	clear : app.host + '/app/cart/deleteAll',
	del : app.host + '/app/cart/delete',
	cut : app.host + '/app/cart/cut'
	//update : app.host + '/mch/cart/update'	
}


handle = {

	// param = { skuNum : 1, skuId : 1 }
	add : function( param, callback ) {
		param = param || {};
		param.skuNum = param.skuNum || 1;
		ajax.query( {
			url : url.add,
			param : param
		}, callback );
	},

	// param = { num : 1, shopId : 1, sku : 1 }
	del : function( param, callback ) {
		var defaultData = {
				checked : true, //是否选中
				data : true,    //是否需要购物车返回数据
				num : 2,        //更新数量
				shopId : 1,     //门店ID
				sku : 123,      //SKUID
				tempId : "xxx", //临时购物车ID
				updateType : 3 //更新类型(1, "设置商品数量"),(2, "增加商品数量"),(3, "减少商品数量");
			};
		param.num = param.num || 1;
		param = utils.merge( defaultData, param );
		param = _fn.addTempId( param );
		ajax.query( {
			url : url.update,
			param : param
		}, function( res ) {
			res = _fn.callbackFilter( res );
			if ( res.code == '0000' && res.success ) {	// 这里判断条件等返回字段统一，ok后处理
				handle.save( res.data );	// 本地存储，是直接在这里处理？
			}
			callback( res );			
		} );
	},

	// param = { shopId :  '' } || param = { shopId : [] }
	query : function( param, callback ) {
		// 应该是根据storeId来，storeId也可以不传
		param = param || {};
		//param.skuNum = param.skuNum || 1;
		ajax.query( {
			url : url.query,
			param : param
		}, callback );
	}
};

_fn = {
	// 处理用户信息，单独打个标记，merge购物车，因为在结算的时候必须merge一次，成功后才下单
	// 处理绑定信息
	addTempId : function( param ) {
		var isMerge = wx.getStorageSync( CFG.isMergeCart ),
			userInfo = wx.getStorageSync( 'userinfo' );

		if ( isMerge == true ) {	// 已经登录也不需要打merge
			return param;
		}
		param.tempId = wx.getStorageSync( CFG.tempId );
		return param;
	},
	callbackFilter : function( res ) {
		var isMerged = wx.getStorageSync( CFG.isMergeCart );
		// 处理购物车merge数据
		if ( !isMerged && res && res.data && res.data.marge ) {
			wx.setStorageSync( CFG.isMergeCart, true );
		}
		return res;
	}
}

// error = {
// 	success : { code : '0000', msg : '' },
// 	paramError : { code : -1111, msg : '参数格式错误' }
// }

module.exports = handle;