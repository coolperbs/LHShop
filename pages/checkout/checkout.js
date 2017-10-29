var ajax = require( '../../common/ajax/ajax' ),
	weigetUtils = require('../../common/utils/weigetUtil'),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	couponService = require('../../service/coupon/coupon'),
	app = getApp(),
	Address = weigetUtils.Address,
	pageParam,
	SCoupon = {},
	_fn;

Page({
	onLoad : function( param ) {
		pageParam = param || {};
	},
	onShow : function() {
		var self = this;

		SCoupon = couponService.cache();
		couponService.cache( null );   
		// 获取页面信息
		_fn.getPageData( function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			if ( res.data.sku && ( !res.data.skus || res.data.skus.length <= 0 ) ) {
				res.data.skus = [ res.data.sku ];
			}
			res.data.sku
			self.setData( {
				pageData : res.data,
				selectedCoupon : SCoupon.selectCoupon || {}
			} );

			if ( res && res.data && res.data.defaultAddress && !self.data.address ) {
				_fn.initAddress( self, res.data.defaultAddress );
			}
		} );
		//this.showAddress();
	},

	selectAddress : function( e ) {
		var id = e.currentTarget.dataset.id,
			data = this.data,
			addressList = data.addressList || {},
			addressInfo,
			i, len;

		addressList = addressList.list || [];
		for ( i = 0, len = addressList.length; i < len; ++i ) {
			if ( addressList[i].addressId == id ) {
				addressInfo = addressList[i];
				break;
			}
		}
		addressInfo = addressInfo || {};
		addressInfo.id = addressInfo.addressId;
		_fn.initAddress( this, addressInfo );
		this.hideAddress();
		// this.setData( {
		// 	'addressList.selectedId' : id
		// } );
	},

	newAddress : function() {
		var address = {};
		_fn.initAddress( this, address );
		this.hideAddress();
	},

	showAddress : function() {
		var self = this,
			address = self.data.address || {},
			id = address.id;
		// 请求列表
		self.setData( {
			showAddress : true,
			'addressList.selectedId' : id
		} );
		utils.showLoading( 300 );
		_fn.getAddressList( self, function( list ){
			var data = self.data,
				selectedId = null;
			utils.hideLoading();
			if ( data && data.address && data.address.id ) {
				selectedId = data.address.id;
			}
			self.setData( {
				addressList : {
					selectedId : selectedId,
					list : list
				}
			} );
		} );
	},

	hideAddress : function() {
		this.setData( {
			showAddress : false
		} );
	},

	goCoupons : function() {
		couponService.cache( {
			selectCoupon : this.data.pageData.defaultCoupon,
			available : this.data.pageData.availableCoupons,
			unavailable : this.data.pageData.unavailabilityCoupons
		} );
		wx.navigateTo( { url : '../coupon-use/coupon-use' } );
	},

	submit : function( e ) {
		var userInfo = wx.getStorageSync( 'userinfo' );
		if ( !userInfo || !userInfo.token ) {
			wx.navigateTo( { url : '../login/login' } );
			return;
		}


		if ( !_fn.checkForm( this, e ) ) {
			return;
		}
		_fn.submit( this, function( res ) {
			// 如果是在线支付就继续调用
			if ( utils.isErrorRes( res )) {
				return;
			}
		} );		
	},
	changeLocation:function(e){
		var self = this;
		self.address.change(e);
	}
});

_fn = {
	getAddressList : function( caller, callback ) {
		var data = caller.data;
		if ( data.addressList ) {
			callback && callback( data.addressList.list );
		}
		ajax.query( {
			url : app.host + '/app/address/list'
		}, function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			callback && callback( res.data );
		} );
	},

	getPageData : function( callback ) {
		var url = '',
			couponId = 0,
			city = wx.getStorageSync( 'city' ),
			selectedCoupon = SCoupon;

		if ( !city || !city.code ) {
			wx.showToast( { title : '缺少地址信息' } );
			return;
		}
		if ( selectedCoupon && selectedCoupon.selectCoupon && selectedCoupon.selectCoupon.id ) {
			couponId = selectedCoupon.selectCoupon.id;
		}
		if ( pageParam.skuid && pageParam.skunum ) {
			url = app.host + '/app/trade/buynow/' + city.code + '/' + pageParam.skuid + '/' + pageParam.skunum + '/' + couponId; //后面那个是优惠券Id
		}
		else if ( pageParam.shopid ) {  // 门店购买
			url = app.host + '/app/trade/cartbuy/' + city.code + '/' + pageParam.shopid + '/' + couponId;
		} else {
			wx.showToast( { title : '缺少页面相关参数' } );
			return;
		}

		ajax.query( {
			url : url
		}, callback );
	},
	initAddress : function( caller, address ) {
		if ( !address ) {
			return;
		}
		caller.address = new Address({
			provinceId : address.province,
			cityId : address.city,
			countryId : address.country,
			changeCallback:function( data ){
				var formData = address;
				if(data.province){
					formData.province = data.province.adcode;
					formData.provinceName = data.province.name;
					formData.lat = data.province.lat;
					formData.lng = data.province.lng;
				}else{
					formData.province = null;
					formData.provinceName = null;
				}
				if(data.city){
					formData.city = data.city.adcode;
					formData.cityName = data.city.name;
					formData.lat = data.city.lat;
					formData.lng = data.city.lng;
				}else{
					formData.city = null;
					formData.cityName = null;
				}
				if(data.country){
					formData.country = data.country.adcode;
					formData.countryName = data.country.name;
					formData.lat = data.country.lat;
					formData.lng = data.country.lng;
				}else{
					formData.country = null;
					formData.countryName = null;
				}
				caller.setData({
					location:data,
					address:formData
				});
			}
		});
		caller.address.change();
	},

	checkForm : function( caller, e ) {
		var newData = e.detail.value || {};
		if ( ( newData.userName + '' ).trim() == '' ) {
			wx.showToast( { title : '请填写联系人' } );
			return false;
		}
		if ( ( newData.userPhone + '' ).trim() == '' ) {
			wx.showToast( { title : '请填写手机号' } );
			return false;
		}
		if( !(/^1[34578]\d{9}$/.test( newData.userPhone )) ){ 
        	wx.showToast( { title : '请填写正确的手机号' } );  
        	return false; 
    	} 
		if ( ( newData.address + '' ).trim() == '' ) {
			wx.showToast( { title : '请填写详细地址' } );
			return false;
		}
		caller.data.address.userName = newData.userName;
		caller.data.address.userPhone = newData.userPhone;
		caller.data.address.address = newData.address;
		return true;
	},
	submit : function( caller ) {
		var data = caller.data;
		// 验证表单数据

		// 1.创建订单
		_fn.createOrder( caller, function( orderRes ) {
			if ( utils.isErrorRes( orderRes ) ) {
				return;
			}
			var orderId = orderRes.data.orderId;
			
			if ( caller.data.type == '到店支付' ) {
				wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId  } );
				return;
			}
			// 2.获取支付订单
			_fn.payOrder( {
				orderId : orderRes.data.orderId
			}, function( payRes ) {
				if ( !payRes || payRes.code != '0000' || !payRes.success ) {
					wx.showModal( {
						title : '提示',
						content : payRes.msg || '系统错误',
						showCancel : false,
						complete : function() { wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } ) }
					} );
					return;
				}
				// 3.唤醒微信支付
				_fn.wxPay( {
					timeStamp : payRes.data.timeStamp,
					nonceStr : payRes.data.nonceStr,
					package : 'prepay_id=' + payRes.data.prepayId,
					paySign : payRes.data.sign					
				}, function() {
					wx.showLoading( { title : '正在更新支付结果...' } );
					setTimeout( function() {
						wx.hideLoading();
						wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId  } );
					}, 2000 );
				} );
			} );
		} );
	},
	createOrder : function( caller, callback ) {
		var data = caller.data;
		var type;
		var address = data.address || {};
		var param = {};
		var url;
		var city = wx.getStorageSync( 'city' );



		address.addressId = address.id || '';
		if ( pageParam.skunum && pageParam.skuid ) {
			param.skuNum = pageParam.skunum;
			param.skuId = pageParam.skuid;
			param.shopId = 1;
		} else if ( pageParam.shopid ) {
			param.shopId = pageParam.shopid;
		} else {
			wx.showToast( { title : '缺少页面相关参数' } );
			return;
		}
		if ( !city || !city.code ) {
			wx.showToast( { title : '缺少地址信息' } );
			return;
		}
		param.citycode = city.code;
		if ( caller.data.selectedCoupon && caller.data.selectedCoupon.id ) {
			param.couponId = caller.data.selectedCoupon.id;
		}


		if ( pageParam.skuid && pageParam.skunum ) {
			url = app.host + '/app/order/buynow/submit';
		}
		else if ( pageParam.shopid ) {  // 门店购买
			url = app.host + '/app/order/cart/submit';
		} else {
			wx.showToast( { title : '缺少页面相关参数' } );
			return;
		}


		param.address = address;
		ajax.query( {
			url : url,
			param : param
		}, callback );
	},

	payOrder : function( param, callback ) {
		ajax.query( {
			url : app.host + '/app/pay/wechatPrePay',
			param : param
		}, callback );		

	},

	wxPay : function( param, callback ) {
		wx.requestPayment( {
			timeStamp : param.timeStamp,
			nonceStr : param.nonceStr,
			package : param.package,
			signType : 'MD5',
			paySign : param.paySign,			
			success : function() {
				callback && callback( true );
			},
			fail : function( ) {
				callback && callback( false );
			}
		} );
	}
}

