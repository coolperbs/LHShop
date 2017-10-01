// 100011 waretype= 2;

let lastPos = 0;
let needRoll = false;
let utils = require( '../../common/utils/utils' );
let service = require( '../../service/service' );	// 是否可以集中生成一个层？只引入service
let _fn;
let pageShopId;
let isJumping = false;

Page( {
	data : {
		shopId : '',
		showCart : false,
		sku : '',
		tab : {
			currentTab : 0,
			pos : 0,
			units : []
		},
		cart : {
			cartNum : {},
			cartList : [],
			totalNum : 0,
			totalPrice : 0
		}
		//cartNum : 0,
		//fullCart : {},
		//simpleCart : {}
	},

	onLoad : function( param ) {
		var id;
		if ( !param || !param.id || param.id.indexOf( '-' ) == -1 ) {
			wx.showModal( {
				title : '提示',
				showCancel : false,
				content : '缺少商品参数',
				complete : function() {
					wx.navigateBack();
				}
			} );
			return;
		}
		id = param.id.split( '-' );
		pageShopId = id[0];
		// 处理请求参数
		this.setData( {
			shopId : id[0],
			sku : id[1]
		} );
	},

	onShow : function() {
		var shopId = this.data.shopId,
			sku = this.data.sku,
			self = this;

		if ( !shopId ) { console.log('缺少门店id'); return;} //这里是否先做UI提示？
		// 显示商详信息
		service.item.getInfo( { shopId : shopId, sku : sku }, function( res ) {
			res = res || {};
			if ( !utils.checkRes( res ) ) {
				return;
			}
			res.data = _fn.formatItemPrice( res.data );
			res.data = _fn.formatStars( res.data );
			self.setData( {
				itemInfo : res.data
			} );
		} );
		// 显示购物车
		service.cart.query( {shopId : shopId}, function( res ) {
			_fn.refreshCart( self, shopId );
		} );
	},

	addCart : function( e ) {
		var sku = e.currentTarget.dataset.sku,
			shopId = e.currentTarget.dataset.shopid,
			self = this;

		if ( !sku || !shopId ) { 
			return;
		}
		service.cart.add( { num : 1, shopId : shopId, sku : sku }, function( re ) {
			// 跟新本地购物车
			_fn.refreshCart( self, shopId );
		} );		
	},

	delCart : function( e ) {
		var sku = e.currentTarget.dataset.sku,
			shopId = e.currentTarget.dataset.shopid,
			self = this;

		if ( !sku || !shopId ) { 
			return;
		}
		service.cart.del( { num : 1, shopId : shopId, sku : sku }, function( re ) {
			// 跟新本地购物车
			_fn.refreshCart( self, shopId );
		} );		
	},

	clickTab : function( e ) {
		if ( !e || !e.currentTarget || !e.currentTarget.dataset ) {
			return;
		}
		this.setData( {
			'tab.currentTab' : e.currentTarget.dataset.index
		} );
	},
	slideTab : function( e ) {
		var index, pos = 0;

		index = typeof e === 'number' ? e : e.detail.current;
		// 处理tab位置
		//if ( index >= 4 ) {
			pos = utils.toPx( ( index - 2 ) * 160 + 40 ) ;
		//}
		// 如何区分是点击tab切换，还是滑动切换？
		this.setData( {
			'tab.currentTab' : index,
			'tab.pos' : pos
		} );

	},

	buynow : function() {
		if ( isJumping ) {
			return;
		}
		isJumping = true;
		var data = this.data,
			skuId = data.sku,
			shopId = data.shopId,
			num = 1,
			targetUrl = '',
			skuInfo;

		if ( !skuId || !num || !shopId ) {
			wx.showToast( { title : '参数不正确' } );
			return;
		}
		skuInfo = { wares : [{ skuId : skuId, wareNum : num }] };
		skuInfo = JSON.stringify( skuInfo );
		//wx.navigateTo( { url : '../checkout/checkout?shopid=' + shopId + '&tradetype=2&skuInfo=' + encodeURIComponent( skuInfo ) } );
		targetUrl = '../checkout/checkout?shopid=' + shopId + '&tradetype=2&skuInfo=' + encodeURIComponent( skuInfo );
		service.user.isLogin( function( isLogin ) {
			isJumping = false;
			if ( !isLogin ) {
				utils.hideLoading();
				wx.navigateTo( { url : '../login/login?url=' + encodeURIComponent( targetUrl ) } );
				return;
			}
			wx.navigateTo( { url : targetUrl } );
		} );
	},

	// 控制购物车样式
	toggleCart : function() {
		var showCart = !this.data.showCart,
			cartData = this.data;

		cartData = cartData.cart || {};
		if ( !cartData.totalNum || cartData.totalNum <= 0 ) {
			showCart = false;
		}
		this.setData( {
			showCart : showCart
		} );
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
} );

_fn = {
	formatStars : function( data ) {
		var stars = [],
			i = 0;
		for ( i = 1; i <= data.evaluateLevel; ++i ) {
			stars.push( { type : 'full' } );
		}
		if ( data.evaluateLevel % 1 > 0 ) {
			stars.push( { type : 'half' } );
		}

		for ( i = stars.length; i < 5; ++i ) {
			stars.push( { type : 'empty' } );
		}
		//console.log( stars );
		data.stars = stars;
		return data;
	},
	formatPrice : function( units ) {
		var k, unit, j, sku;
		for ( k = 0; unit = units[k]; ++k ) {
			if ( !unit.wareSkus || unit.wareSkus.length < 1 ) { continue; }
			for ( j = 0; sku = unit.wareSkus[j]; ++j ) {
				sku.originPriceStr = utils.fixPrice( sku.originPrice );
				sku.priceStr = utils.fixPrice( sku.price );
				sku.discount = sku.price == 0 ? 0 : sku.price - sku.originPrice;
				sku.discountStr= utils.fixPrice( sku.discount );
			}
		}		
		return units;
	},
	formatItemPrice : function( data ) {
		data.priceStr = utils.fixPrice( data.price );
		data.originPriceStr = data.originPrice ? utils.fixPrice( data.originPrice ) : '';
		return data;
	},
	// 刷新本地购物车
	refreshCart : function( caller, shopId ) {
		var cartData = service.cart.get(),
			showCart = caller.data.showCart;

		cartData = _fn.formatCart( cartData, shopId );
		if ( cartData.totalNum <= 0 ) {
			showCart = false;
		}		
		caller.setData( {
			cart : cartData
		} );
	},
	// 这个方法如果用的多就罗列到cartservice
	formatCart : function( data, shopId ) {
		var cartNum = {}, 
			cartList = [],
			totalNum = 0,
			totalPrice = 0,
			currentShop,
			i, shop, k, unit, j, sku;

		if ( !data || !data.shops ) {
			return {};
		}

		// 服了这3层循环，下来优化
		for ( i = 0; shop = data.shops[i]; ++i ) {
			if ( shopId != shop.shopId || !shop.units || shop.units.length < 1 ) { continue; }
			if ( pageShopId == shop.shopId ) {
				currentShop = shop;
			}
			totalPrice += shop.totalPromotionPrice;
			for ( k = 0; unit = shop.units[k]; ++k ) {
				if ( !unit.skus || unit.skus.length < 1 ) { continue; }
				for ( j = 0; sku = unit.skus[j]; ++j ) {
					cartNum[shop.shopId + '-' + sku.skuId] = sku.num;
					// sku.priceStr = utils.fixPrice( sku.price );
					// sku.promotionPriceStr = utils.fixPrice( sku.promotionPrice );
					cartList.push( sku );
					totalNum += sku.num;
				}
			}
			console.log( currentShop );
		}
		return {
			cartNum : cartNum,
			cartList : cartList,
			totalNum : totalNum,
			currentShop : currentShop,
			totalPrice : utils.fixPrice( totalPrice )
		}
	}
}