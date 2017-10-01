let lastPos = 0;
let needRoll = false;
let utils = require( '../../common/utils/utils' );
let service = require( '../../service/service' );	// 是否可以集中生成一个层？只引入service
let _fn;
let isJumping = false;
let pageShopId;

Page( {
	data : {
		shopId : '',
		showCart : false,
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
		},
		//cartNum : 0,
		//fullCart : {},
		//simpleCart : {},
		//anim : { items : {} }
	},

	onLoad : function( param ) {
		pageShopId = param.shopid || '';
		// 处理请求参数
		this.setData( {
			shopId : param.shopid
		} );
	},

	onReady : function() {
		var shopId = this.data.shopId,
			self = this;

		if ( !shopId ) { console.log('缺少门店id'); return;} //这里是否先做UI提示？
		console.log( service.user.isPlus() );
		// 请求接口，考虑是否要挪到onShow
		service.store.getInfo( shopId, function( res ) {
			if ( res.code != '0000' || !res.success ) {
				wx.showModal( {
					title : '提示',
					content : res.msg || '系统错误',
					showCancel : false,
					complete : function() {
						wx.navigateBack();
					}
				} );
				return;
			}
			console.log( res );
			res.data.units = _fn.formatPrice( res.data.units );
			self.setData( {
				'tab.units' : res.data.units
			} );
		} );
	},

	onShow : function() {
		var self = this,
			shopId = self.data.shopId;
		// 购物车清空
		service.cart.query( {shopId : shopId}, function( res ) {
			if ( !utils.checkRes( res ) ) {
				return;
			}
			_fn.refreshCart( self, shopId );
		} );
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
	addCart : function( e ) {
		var sku = e.currentTarget.dataset.sku,
			shopId = e.currentTarget.dataset.shopid,
			self = this;

			console.log( e );
		if ( !sku || !shopId ) { 
			return;
		}
		service.cart.add( { num : 1, shopId : shopId, sku : sku }, function( res ) {
			if ( !utils.checkRes( res ) ) {
				return;
			}
			// 跟新本地购物车
			_fn.refreshCart( self, shopId, sku, 1 );
		} );		
	},

	delCart : function( e ) {
		var sku = e.currentTarget.dataset.sku,
			shopId = e.currentTarget.dataset.shopid,
			self = this;

		if ( !sku || !shopId ) { 
			return;
		}
		service.cart.del( { num : 1, shopId : shopId, sku : sku }, function( res ) {
			if ( !utils.checkRes( res ) ) {
				return;
			}
			// 跟新本地购物车
			_fn.refreshCart( self, shopId, sku, 2 );
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
	formatPrice : function( units ) {
		var k, unit, j, sku;
		for ( k = 0; unit = units[k]; ++k ) {
			if ( !unit.wareSkus || unit.wareSkus.length < 1 ) { continue; }
			for ( j = 0; sku = unit.wareSkus[j]; ++j ) {
				sku.originPriceStr = utils.fixPrice( sku.originPrice );
				sku.priceStr = utils.fixPrice( sku.price );
				sku.discount = sku.price == 0 ? 0 : sku.originPrice - sku.price || 0;
				sku.discountStr= utils.fixPrice( sku.discount );
			}
		}		
		return units;
	},
	// 刷新本地购物车
	refreshCart : function( caller, shopId, sku, animType ) {
		var cartData = service.cart.get(),
			showCart = caller.data.showCart;

		cartData = _fn.formatCart( cartData, shopId, sku, animType );
		if ( cartData.totalNum <= 0 ) {
			showCart = false;
		}
		caller.setData( {
			showCart : showCart,
			cart : cartData
		} );
	},
	// 这个方法如果用的多就罗列到cartservice
	formatCart : function( data, shopId, skuId, animType ) {
		var cartNum = {}, 
			cartList = [],
			anim = {},
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
					if ( skuId == sku.skuId && shopId == shop.shopId ) {
						anim[shop.shopId + '-' + sku.skuId] = _fn.createAnim( animType );
					}
					//console.log( sku );
					//sku.priceStr = utils.fixPrice( sku.price );
					//sku.promotionPriceStr = utils.fixPrice( sku.promotionPrice );
					cartList.push( sku );
					totalNum += sku.num;
				}
			}
		}
		return {
			cartNum : cartNum,
			anim : anim,
			cartList : cartList,
			currentShop : currentShop,
			totalNum : totalNum,
			totalPrice : utils.fixPrice( totalPrice )
		}
	},

	createAnim : function( animType ) {	// 1加、2减
		var anim = wx.createAnimation(),
			step;

		step = animType == 2 ? 20 : -20;
		step = utils.toPx( step );
		anim.translateY( -step / 1.5 ).step( { duration : 60, timingFunction: 'ease' } );
    	anim.translateY( step ).opacity( 0 ).step( { duration : 120, timingFunction: 'ease' } );
    	anim.translateY( 0 ).opacity( 1 ).step( { duration : 200, timingFunction: 'ease' } );
    	return anim.export();
	}

}