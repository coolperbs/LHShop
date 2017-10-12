var ajax = require( '../../common/ajax/ajax' ),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	isPaying = false,
	currentShipmentCache,
	notRefresh,
	loadingTimer,
	isIn,
	_fn;

Page({
	data : {
		shopId : '',
		tradeInfo : {
			modules : {}
		}
	},
	onLoad : function( param ) {
		return;
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
		return;
		isIn = true;
		isPaying = false;
		var self = this,
			shopId = self.data.shopId,
			data = self.data,
			coupon = service.coupon.getSelectedCoupon(),
			param = {};

		param.shopId = shopId;
		param.tradeType = data.tradeType;
		if ( data.tradeType == 2 ) {
			param.wares = data.skuInfo.wares || [];
		}
		if ( notRefresh ) {
			return;
		}

		if ( coupon && coupon.couponCode ) {
			param.couponCode =coupon.couponCode;
			service.coupon.removeSelectedCoupon();
		}
		utils.showLoading( { title : '加载中...' }, 300 );
		service.trade.getInfo( param, function( res ) {
			utils.hideLoading();
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

	onUnload : function() {
		isIn = false;
		if ( loadingTimer ) {
			clearTimeout( loadingTimer );
		}		
	},

/*	onHide : function(){ 
		isIn = false;
		if ( loadingTimer ) {
			clearTimeout( loadingTimer );
		}
	},*/

	// 跳转到优惠券页面
	goCoupons : function( e ) {
		var tradeInfo = this.data.tradeInfo;

		if(tradeInfo.modules.coupon && 
		   tradeInfo.modules.coupon.data&&
		   tradeInfo.modules.coupon.data.valid&&
		   tradeInfo.modules.coupon.data.valid.length>0){
		   	//var selectedCoupon = service.coupon.getSelectedCoupon();//用户选择的优惠券
		   	var allCoupons = tradeInfo.modules.coupon.data.valid;//可以用的优惠券
		   	_fn.setSelectedCoupons( tradeInfo.modules.coupon );
		   	//service.coupon.setSelectedCoupons(  );
			service.coupon.setCoupons(allCoupons);
		}
		wx.navigateTo( { url : '../coupon/coupon' } );
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

/*	recharge : function() {
		console.log('t' );
		return;
		_fn.submit( this, true );
	},

	normalPay : function() {
		console.log( 'fff' );
		return;
		_fn.submit( this, false );
	},*/
	submit : function( e ) {
		var type = e.detail.target.dataset.type,
			isCharge = false;

		isCharge = type * 1 == 1 ? true : false;
/*		wx.showModal( {
			title : '',
			content : e.detail.formId
		} );
		return;*/
		_fn.submit( this, isCharge, e.detail.formId );
	}
});

_fn = {
	submit : function( caller, isCharge, formId ) {
		
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
			balanceRuleId : isCharge ? tradeInfo.modules.submit.data.propayRuleId : '', // 充值需要把命中id传过去，改到price后这个id没有了
			pdupUuid : tradeInfo.pdupUuid,	// 防重token
			shipmentType : tradeInfo.currentShipment.type,	// 配送方式
			addressId : addressId,	// 地址id
			isCharge : isCharge,	// 充值还是支付
			formId : formId,
			wareTotalNum : tradeInfo.modules.wares.data.num,
			paymentType : tradeInfo.paymentType,
			couponCode : tradeInfo.modules.coupon.data.couponCode,
			payPrice : tradeInfo.modules.price.data.payPrice,
			totalFee : isCharge ? tradeInfo.modules.submit.data.propayBalance : tradeInfo.modules.submit.data.payprice // 总价
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

		utils.showLoading( { title : '加载中...' }, 300 );
		submitParam = {
			shopId : param.shopId,
			//balanceRuleId : tradeInfo.modules.paypromote.data.rule.id,	左边按钮才传
			balanceRuleId : param.balanceRuleId,
			pdupUuid : param.pdupUuid,
			shipmentType : param.shipmentType,
			addressId : param.addressId,
			wareTotalNum : param.wareTotalNum,
			paymentType : param.paymentType,
			formId : param.formId,
			payPrice : param.payPrice,
			couponCode : param.couponCode,
			tradeType : data.tradeType
		}

		// 预售订单
		if ( data.tradeType == 2 ) {
			//wares:[{wareNum:1,skuId:100011}]
			submitParam.wares = _fn.createWares( data );
		}
		// 1.创建订单
		service.trade.submit( submitParam, function( orderRes ) {
			utils.hideLoading();
			if ( !orderRes || orderRes.code != '0000' || !orderRes.data || !orderRes.data.orderId ) {
				isPaying = false;
				wx.showToast( { title : orderRes.msg } );
				return;
			}
			_fn.showLoading( caller, function() {
				notRefresh = true;
				if ( !isIn ) {
					isPaying = false;
					return;
				}
				orderId = orderRes.data.orderId

				if ( !orderRes.data.needPay ) {
					isPaying = false;
					wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
					return;
				}

				_fn.hideLoading( caller );
				// 2.调用后台支付码，获取支付相关信息
				utils.showLoading( { title : '加载中...' }, 300 );
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
						if ( isIn ) {
							wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
						}
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
							if ( isIn ) {
								wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
							}
							// 跳转到订单
							return;
						}
						if ( isIn ) {
							wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
						}
						// 跳转到订单
					} );
				} );
			} );
		} );
	},

	setSelectedCoupons : function( module ) {
		var i, len, code;
		if ( !module || !module.data || !module.data.couponCode || !module.data.valid || !module.data.valid.length ) {
			return;
		}

		code = module.data.couponCode;
		for ( i = 0, len = module.data.valid.length; i < len; ++i ) {
			if ( module.data.valid[i].couponCode + '' == code + '' ) {
				service.coupon.setSelectedCoupon( module.data.valid[i] );
				return;
			}
		}
	},

	createWares : function( data ) {
		var result = [],
			units, i, u, j, sku;
		if ( !data || !data.tradeInfo || !data.tradeInfo.modules 
			|| !data.tradeInfo.modules.wares || !data.tradeInfo.modules.wares.data 
			|| !data.tradeInfo.modules.wares.data.units ) {
			return result;
		}

		units = data.tradeInfo.modules.wares.data.units;
		for ( i = 0; u = units[i]; ++i ) {
			if ( !u.skus || u.skus.length <= 0 ) { continue; }
			for ( j = 0; sku = u.skus[j]; ++j ) {
				result.push( { 
					skuId : sku.skuId,
					wareNum : sku.num
				} );
			}
		}
		return result;
	},

	showLoading : function( caller, callback ) {
		caller.setData( {
			showLoading : true
		} );
		loadingTimer = setTimeout( function() {
			_fn.showStep( caller, 1, callback );
		}, 500 );
	},

	hideLoading : function( caller ) {
		caller.setData( {
			showLoading : false
		} );
	},

	showStep : function( caller, step, callback ) {
		if ( !isIn ) {
			return;
		}
		console.log( isIn );
		if ( step > 3 && isIn == true ) {
			callback && callback();
			return;
		}
		var time = 800;
		caller.setData( {
			step : step
		} );

		loadingTimer = setTimeout( function() {
			_fn.showStep( caller, ++step, callback )
		}, time );
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
			data.modules.submit.data.propayBalanceStr = utils.fixPrice( data.modules.submit.data.propayBalance, 0 );
			data.modules.submit.data.propayBalanceFreeStr = utils.fixPrice( data.modules.submit.data.propayBalanceReal - data.modules.submit.data.propayBalance, 0 );
		}

		// 处理开通会员展示
		if ( data && data.modules && data.modules.price && data.modules.price.data ) {
			data.modules.price.data.plusDiscountPriceStr = utils.fixPrice( data.modules.price.data.plusDiscountPrice );
			data.modules.price.data.oneYearPlusPriceStr = utils.fixPrice( data.modules.price.data.oneYearPlusPrice );
			data.modules.price.data.waresPriceStr = utils.fixPrice( data.modules.price.data.waresPrice );
			data.modules.price.data.oneYearPlusOrginPriceStr = utils.fixPrice( data.modules.price.data.oneYearPlusOrginPrice );
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