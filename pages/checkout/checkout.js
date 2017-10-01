var ajax = require( '../../common/ajax/ajax' ),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	isPaying = false,
	currentShipmentCache,
	notRefresh,
	_fn;

Page({
	data : {
		shopId : '',
		tradeInfo : {
			modules : {}
		}
	},
	onLoad : function( param ) {
		var skuInfo = param.skuInfo || '{}';

		skuInfo = decodeURIComponent( skuInfo );
		currentShipmentCache = null;
		notRefresh = false;
		this.setData( {
			shopId : param.shopid || '',
			skuInfo : JSON.parse( skuInfo ),
			tradeType : param.tradetype || 1
		} );
	},
	onShow : function(){ 
		var self = this,
			shopId = self.data.shopId,
			data = self.data,
			param = {};

		param.shopId = shopId;
		param.tradeType = data.tradeType;
		if ( data.tradeType == 2 ) {
			param.wares = data.skuInfo.wares || [];
		}
		if ( notRefresh ) {
			return;
		}
		service.trade.getInfo( param, function( res ) {
			if ( res.code != '0000' || !res.success ) {	// 直接抽象成方法
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

			var tradeInfo = res.data;
			tradeInfo = _fn.format( tradeInfo );
			tradeInfo.modules = tradeInfo.modules || {};
			tradeInfo.modules.address = tradeInfo.modules.address || {};
			_fn.formatPrice( tradeInfo );
			service.address.cache( tradeInfo.modules.address.data );
			self.setData( {
				tradeInfo : tradeInfo
			} );
		} );
	},

	changeShipment : function( e ) {
		var index = e.detail.value,
			tradeInfo = this.data.tradeInfo,
			currentShipment = tradeInfo.modules.shipment.data[index];

		currentShipmentCache = currentShipment;
		this.setData( {
			'tradeInfo.currentShipment' : currentShipment,
			'tradeInfo.shipmentType' : currentShipment.type,
			'tradeInfo.shipmentTypeDesc' : currentShipment.name
		} );
	},

	recharge : function() {
		_fn.submit( this, true );
	},

	normalPay : function() {
		_fn.submit( this, false );
	}
});

_fn = {
	submit : function( caller, isCharge ) {
		var self = caller,
			data = self.data,
			tradeInfo = data.tradeInfo,
			addressId,
			shopId = data.shopId;


		tradeInfo.modules.address.data = tradeInfo.modules.address.data || {};
		addressId = tradeInfo.currentShipment.type === 2 ? "" : tradeInfo.modules.address.data.id;

		// 1为配送 2为自提
		if( tradeInfo.currentShipment.type === 1 && !addressId ) {
			wx.showToast( { title : '请填写收货信息' } );
			return;
		}

		_fn.submitFull( caller, {
			shopId : shopId, // 门店id
			balanceRuleId : isCharge ? tradeInfo.modules.paypromote.data.rule.id : '', // 充值需要把命中id传过去
			pdupUuid : tradeInfo.pdupUuid,	// 防重token
			shipmentType : tradeInfo.currentShipment.type,	// 配送方式
			addressId : addressId,	// 地址id
			isCharge : isCharge,	// 充值还是支付
			wareTotalNum : tradeInfo.modules.wares.data.num,
			paymentType : tradeInfo.paymentType,
			payPrice : tradeInfo.modules.price.data.payPrice,
			totalFee : isCharge ? tradeInfo.modules.paypromote.data.rule.balance : tradeInfo.modules.submit.data.payprice // 总价
		} );
	},

	submitFull : function( caller, param ) {
		if ( isPaying ) {
			return;
		}
		isPaying = true;
		var self = caller,	
			data = self.data,
			submitParam,
			orderId;

		wx.showLoading( { title : '加载中...' } );

		submitParam = {
			shopId : param.shopId,
			//balanceRuleId : tradeInfo.modules.paypromote.data.rule.id,	左边按钮才传
			balanceRuleId : param.balanceRuleId,
			pdupUuid : param.pdupUuid,
			shipmentType : param.shipmentType,
			addressId : param.addressId,
			wareTotalNum : param.wareTotalNum,
			paymentType : param.paymentType,
			payPrice : param.payPrice,
			tradeType : data.tradeType
		}
		if ( data.tradeType == 2 ) {
			console.log( data );
		}
		// 1.创建订单
		service.trade.submit( submitParam, function( orderRes ) {
			if ( !orderRes || orderRes.code != '0000' || !orderRes.data || !orderRes.data.orderId ) {
				wx.hideLoading();
				isPaying = false;
				wx.showToast( { title : orderRes.msg } );
				return;
			}
			notRefresh = true;
			orderId = orderRes.data.orderId

			if ( !orderRes.data.needPay ) {
				isPaying = false;
				wx.hideLoading();
				wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
				return;
			}
			// 2.调用后台支付码，获取支付相关信息
			service.trade.pay( {
				orderId : orderRes.data.orderId,
				autoPay : param.isCharge ? true : false,
				totalFee : param.totalFee
			}, function( payRes ) {
				var data;
				wx.hideLoading();
				if ( !payRes || payRes.code != '0000' ) {
					wx.showToast( { title : payRes.msg } );
					isPaying = false;
					wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
					// 跳转到订单
					return;
				}
				data = payRes.data;
				// 3.唤醒微信支付
				service.trade.wxPay( {
					timeStamp : data.timeStamp,
					nonceStr : data.nonce_str,
					package : 'prepay_id=' + data.prepay_id,
					signType : 'MD5',
					paySign : data.sign					
				}, function( wxRes ) {
					wx.hideLoading();
					isPaying = false;
					if ( !wxRes || wxRes.code != '0000' ) {
						wx.showToast( { title : wxRes.msg } );
						wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
						// 跳转到订单
						return;
					}
					wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
					// 跳转到订单
				} );
			} );
		} );
	},

	format : function( data ) {
		var list, result = [], i, p, addressData;

		if ( !data || !data.modules || !data.modules.shipment ) {
			return data;
		}

		// 初始化文案
		list = data.modules.shipment.data || [];
		for ( i = 0; p = list[i]; ++i ) {
			result.push( p.name );
			if ( p.type == data.shipmentType ) {
				data.currentShipment = currentShipmentCache || p;
			}
		}
		data.shipmentList = result;

		addressData = data.modules.address.data||{};
		// data.addressShowName = addressData.addressName || addressData.provinceName + ( ( addressData.cityName != address.provinceName || address.cityName != '县' ) ? address.cityName : '' ) + addressData.areaName ;
		data.addressShowName = '';
		data.addressShowName += addressData.addressDetail || '';
		if ( !data.addressShowName ) {
			data.addressShowName = '';
		}

		return data;
	},

	formatPrice : function( data ) {
		var k, unit, j, sku;
		// 处理余额
		if ( data && data.modules && data.modules.balance && data.modules.balance.data && typeof data.modules.balance.data.total !== 'undfined' ) {
			data.modules.balance.data.totalStr = utils.fixPrice( data.modules.balance.data.total );
			data.modules.balance.data.availableStr = utils.fixPrice( data.modules.balance.data.available );
		}

		// 处理支付价格
		if ( data && data.modules && data.modules.submit && data.modules.submit.data ) {
			data.modules.submit.data.paypriceStr = utils.fixPrice( data.modules.submit.data.payprice );
		}

		// 处理商品价格
		if ( data && data.modules && data.modules.wares && data.modules.wares.data && data.modules.wares.data.units && data.modules.wares.data.units.length ) {
			for ( k = 0; unit = data.modules.wares.data.units[k]; ++k ) {
				if ( !unit.skus || unit.skus.length < 1 ) { continue; }
				for ( j = 0; sku = unit.skus[j]; ++j ) {
					sku.promotionPriceStr = utils.fixPrice( sku.promotionPrice );
					sku.priceStr = utils.fixPrice( sku.price );
					// sku.discount = sku.price == 0 ? 0 : sku.price - sku.originPrice;
					// sku.discountStr= utils.fixPrice( sku.discount );
				}
			}		
		}
		return data;
	}
}