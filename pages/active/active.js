var service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	isJumping = false,
	_fn;

Page( {
	data : {
		shopId : 1,
		moduleList : [],
		settings : {}
	},

	onLoad : function( options ) {
		this.setData( {
			shopId : options.shopid,
			activeId : options.actid
		} );
	},

	onReady : function() {
		var self = this,
			data = self.data;

		if ( !data.shopId || !data.activeId ) {
			wx.showModal( {
				title : '提示',
				content : '没找到相关活动',
				showCancel : false,
				complete : function() {
					wx.navigateBack();
				}
			} );
			return;
		}

		service.active.getInfo( { shopId : data.shopId, activeId : data.activeId }, function( res ) {
			if ( !utils.checkRes( res ) ) {
				return;
			}

			res.data = res.data || {};
			res.data = _fn.format( res.data );
			self.setData( {
				moduleList : res.data.moduleList,
				settings : res.data.settings
			} );
		} );
	},

	autoBuy : function( e ) {
		if ( isJumping ) {
			return;
		}
		isJumping = true;
		var dataset = e.currentTarget.dataset,
			skuId = dataset.sku,
			num = dataset.num,
			shopId = this.data.shopId,
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

	jumpToItem : function( e ) {
		var data = this.data,
			sku = e.currentTarget.dataset.sku,
			shopId = data.shopId;

		if ( !shopId && !sku ) {
			return;
		}
		wx.navigateTo( { url : '../item/item?id=' + shopId + '-' + sku } );
	}
} );

_fn = {
	format : function( data ) {
		var i = 0, module;
		//data = _fn.formatPrice( data );
		for ( i = 0; module = data.moduleList[i]; ++i ) {
			if ( module.templatePrototypeId * 1 == 1 && module.modulePrototypeId * 1 == 1 ) {	// 找到商品相关的模板，优化价格
				data.moduleList[i] = _fn.formatPrice( data.moduleList[i] );
			}
		}
		return data;
	},
	formatPrice : function( data ) {
		var i, sku;
		if ( !data.data || !data.data.storeWareSkus || !data.data.storeWareSkus.length ) {
			return data;
		}
		for ( i = 0; sku = data.data.storeWareSkus[i]; ++i ) {
			sku.originPriceStr = utils.fixPrice( sku.originPrice );
			sku.priceStr = utils.fixPrice( sku.price );
			sku.discount = sku.price == 0 ? 0 : sku.originPrice - sku.price || 0;
			sku.discountStr= utils.fixPrice( sku.discount );			
		}
		return data;
	}
}



