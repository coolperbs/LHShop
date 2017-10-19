var ajax = require( '../../common/ajax/ajax' ),
	weigetUtils = require('../../common/utils/weigetUtil'),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
	Address = weigetUtils.Address,
	pageParam,
	_fn;

Page({
	onLoad : function( param ) {
		pageParam = param || {};
	},
	onShow : function() {
		var self = this;
		// 获取页面信息
		_fn.getPageData( function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			self.setData( {
				pageData : res.data
			} );
			if ( res && res.data && res.data.defaultAddress && !self.data.address ) {
				_fn.initAddress( self, res.data.defaultAddress );
			}
		} );
	},

	showAddress : function() {
		// 请求列表
		this.setData( {
			showAddress : true
		} );
	},

	hideAddress : function() {
		this.setData( {
			showAddress : false
		} );
	},

	goCoupons : function() {
		wx.navigateTo( { url : '../mycoupon/mycoupon' } );
	},

	submit : function( e ) {
		var userInfo = wx.getStorageSync( 'userinfo' );
		if ( !userInfo || !userInfo.token ) {
			wx.navigateTo( { url : '../login/login' } );
			return;
		}


		_fn.checkForm( this, e );
		_fn.submit( this, function( res ) {
			// 如果是在线支付就继续调用
			if ( utils.isErrorRes( res )) {
				return;
			}
		} );		
	},
	changeLocation:function(e){
		var self = this;
		console.log( self.data );
		self.address.change(e);
	}
});

_fn = {
	getPageData : function( callback ) {
		ajax.query( {
			url : app.host + '/app/trade/cartbuy/' + pageParam.shopid
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
			return;
		}
		if ( ( newData.userPhone + '' ).trim() == '' ) {
			wx.showToast( { title : '请填写手机号' } );
			return;
		}
		if( !(/^1[34578]\d{9}$/.test( newData.userPhone )) ){ 
        	wx.showToast( { title : '请填写正确的手机号' } );  
        	return; 
    	} 
		if ( ( newData.address + '' ).trim() == '' ) {
			wx.showToast( { title : '请填写详细地址' } );
			return;
		}
		caller.data.address.userName = newData.userName;
		caller.data.address.userPhone = newData.userPhone;
		caller.data.address.address = newData.address;
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
				wx.redirectTo( { url : '../orderdetail/orderdetail?orderId=' + orderId  } );
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
						complete : function() { wx.redirectTo( { url : '../orderdetail/orderdetail?orderId=' + orderId } ) }
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
					wx.redirectTo( { url : '../orderdetail/orderdetail?orderId=' + orderId  } );
				} );
			} );
		} );
	},
	createOrder : function( caller, callback ) {
		var data = caller.data;
		var type;
		var address = data.address;

		address.addressId = address.id || '';
		ajax.query( {
			url : app.host + '/app/order/cart/submit',
			param : {
				shopId : pageParam.shopid,
				address : address
			}
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

