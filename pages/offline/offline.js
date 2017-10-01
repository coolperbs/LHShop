var fn,	CFG,
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	param, pageShopId, isJumping =false;	

CFG = {
	offlineStore : 'offstore'
}

Page({
	data : {
		cart : {} // 购物车信息
	},
	onLoad : function( options ) {
		param = {};

		if ( options && options.shopid && options.sku ) {
			param = options;
			wx.setStorageSync( 'offlineshop', { shopId : options.shopid, shopName : '', shopAddress : '' } );
		}
	},
	jumpToItem : function( e ) {
		var data = this.data,
			sku = e.currentTarget.dataset.sku,
			shopId = data.shopId;

		if ( !shopId && !sku ) {
			return;
		}
		wx.navigateTo( { url : '../item/item?id=' + shopId + '-' + sku } );
	},
	onReady : function() {
		var shopInfo = wx.getStorageSync( 'offlineshop' ),
			shopId,
			self = this;

		if ( param.shopid && param.sku ) {	// 微信扫码添加
			utils.showLoading( 300 );
			fn.addCart( { num : 1, shopId : param.shopid, sku : param.sku }, function( addCartRes ) {
				utils.hideLoading();
				if ( !utils.checkRes( addCartRes ) ) { 
					return;
				}
				fn.refreshCart( self, param.shopid );
			} );			
			return;
		}

		shopInfo = shopInfo || {};
		shopId = param.shopid ? param.shopid : shopInfo.shopId;
		pageShopId = shopId || '';
		this.setData( {
			shopId : shopId
		} );
		if ( !shopId ) {
			return;
		}
		utils.showLoading( 300 );
		service.cart.query( { shopId : shopId }, function( res ) {
			utils.hideLoading();
			if ( !utils.checkRes( res ) ) {
				return;
			}
			fn.refreshCart( self, shopId );
		} );
	},

	addCart : function( e ) {
		var sku = e.currentTarget.dataset.sku,
			shopId = e.currentTarget.dataset.shopid,
			self = this;

		if ( !sku || !shopId ) { 
			return;
		}
		utils.showLoading( 300 );
		service.cart.add( { num : 1, shopId : shopId, sku : sku }, function( res ) {
			utils.hideLoading();
			// 跟新本地购物车
			if ( !utils.checkRes( res ) ) {
				return;
			}
			fn.refreshCart( self, shopId );
		} );		
	},

	delCart : function( e ) {
		var sku = e.currentTarget.dataset.sku,
			shopId = e.currentTarget.dataset.shopid,
			self = this;

		if ( !sku || !shopId ) { 
			return;
		}
		utils.showLoading( 300 );
		service.cart.del( { num : 1, shopId : shopId, sku : sku }, function( res ) {
			utils.hideLoading();
			if ( !utils.checkRes( res ) ) {
				return;
			}
			// 跟新本地购物车
			fn.refreshCart( self, shopId );
		} );		
	},
	scan : function() {
		var self = this;
		wx.scanCode({
			onlyFromCamera : true,
			success : function( res ) {
				res = res || {};
				// res.result = 'page?shopid=2&sku=100000';
				res.result = 'page?shopid=1&sku=100002';
				var scanObj = fn.parseScan( res.result );
				if ( !scanObj ) {
					wx.showToast( { title : '解析二维码失败，请重试。' } );
					return;
				}
				utils.showLoading( 300 );
				fn.addCart( { num : 1, shopId : scanObj.shopid, sku : scanObj.sku }, function( addCartRes ) {
					utils.hideLoading();
					fn.refreshCart( self, scanObj.shopid );
				} );
			},
			fail : function( res ) {
				if ( res.errMsg == 'scanCode:fail' ) {
					wx.showToast( { title : '解析二维码失败，请重试。' } );
					return;
				}
			}
		});
	},
	submit : function() {
		var cart = this.data.cart || {};
		if ( !cart.cartList || cart.cartList.length == 0 ) {
			wx.showToast( { title : '请添加商品' } );
			return;
		}
		if ( isJumping ) {
			return;
		}
		isJumping = true;
		var shopId = this.data.shopId || '';

		utils.showLoading( 300 );
		// 1.判断登录态	
		service.user.isLogin( function( isLogin ) {
			var checkoutUrl = '../checkout/checkout?shopid=' + shopId;
			if ( !isLogin ) {
				utils.hideLoading();
				isJumping = false;
				wx.navigateTo( { url : '../login/login?url=' + encodeURIComponent( checkoutUrl ) } );
				return;
			}
			// 2.判断购物车是否合并
			if ( service.cart.isMerged() ) {
				utils.hideLoading();
				isJumping = false;
				wx.navigateTo( { url : checkoutUrl } );
				return;
			}
			// 3.合并购物车
			service.cart.merge( function( merged ) {
				utils.hideLoading();
				isJumping = false;
				if ( !merged ) {
					wx.showToast( { title : '购物车合并失败，请重试' } );
					return;
				}
				wx.navigateTo( { url : checkoutUrl } );
			} );
		} );
	}
});

fn = {
	addCart : function( param, callback ) {
		service.cart.add( param, function( res ) {
			if ( !utils.checkRes( res ) ) {
				return;
			}
			// 跟新本地购物车
			callback && callback( res );
		} );
	},
	// 刷新本地购物车
	refreshCart : function( caller, shopId ) {
		var cartData = service.cart.get(),
			shopData;


		cartData = fn.formatCart( cartData, shopId );
		if ( cartData && cartData.shopInfo && cartData.shopInfo.shopId ) {
			wx.setStorageSync( 'offlineshop', cartData.shopInfo );
		}
		caller.setData( {
			cart : cartData
		} );
	},

	// 这个方法如果用的多就罗列到cartservice，这里还要过滤门店
	formatCart : function( data, shopId ) {
		var cartNum = {}, 
			cartList = [],
			totalNum = 0,
			totalPrice = 0,
			shopInfo = [],
			currentShop,
			i, shop, k, unit, j, sku;

		if ( !data || !data.shops ) {
			return null;
		}

		// 服了这3层循环，下来优化
		for ( i = 0; shop = data.shops[i]; ++i ) {
			if ( shop.shopId != shopId || !shop.units || shop.units.length < 1 ) { continue; }
			//if ( !shop.units || shop.units.length < 1 ) { continue; }
			shopInfo.push( {
				shopId : shop.shopId,
				shopName : shop.shopName,
				shopAddress : shop.shopAddress
			} );
			currentShop = shop;
			totalPrice += shop.totalPromotionPrice;
			for ( k = 0; unit = shop.units[k]; ++k ) {
				if ( !unit.skus || unit.skus.length < 1 ) { continue; }
				for ( j = 0; sku = unit.skus[j]; ++j ) {
					cartNum[shop.shopId + '-' + sku.skuId] = sku.num;
					//sku.priceStr = utils.fixPrice( sku.price );
					//sku.promotionPriceStr = utils.fixPrice( sku.promotionPrice );
					/*if ( sku.promotionPrice ) {
						sku.discountAll = sku.price - sku.promotionPrice;
						sku.discountAll = sku.discountAll * sku.num;
						sku.discountAllStr= utils.fixPrice( sku.discountAll );
						console.log( sku.discountAllStr );
					}*/
					cartList.push( sku );
					totalNum += sku.num;
				}
			}
		}
		return {
			cartNum : cartNum,
			cartList : cartList,
			totalNum : totalNum,
			units : currentShop ? currentShop.units || [] : [],
			totalPrice : utils.fixPrice( totalPrice ),
			shopInfo : currentShop || {}
		}
	},
	parseScan : function( path ) {
		path = path || '';
		var result = {},
			i, p;

		path = path.split( '?' )[1] || '';
		path = path.split( '&' );
		for ( i = 0; p = path[i]; ++i ){
			p = p.split( '=' );
			result[p[0]] = p[1];
		}
		if ( result.shopid && result.sku ) {
			return result;
		} 
		return null;
	}
}