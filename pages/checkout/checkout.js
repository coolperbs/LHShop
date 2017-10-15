var ajax = require( '../../common/ajax/ajax' ),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
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
			console.log( res );
		} );
	},

	submit : function() {
		var userInfo = wx.getStorageSync( 'userinfo' );
		if ( !userInfo || !userInfo.token ) {
			wx.navigateTo( { url : '../login/login' } );
			return;
		}
		_fn.submit( this, function( res ) {
			// 如果是在线支付就继续调用
			if ( utils.isErrorRes( res )) {
				return;
			}
		} );		
	}
});

_fn = {
	getPageData : function( callback ) {
		ajax.query( {
			url : app.host + '/app/trade/cartbuy/' + pageParam.shopid
		}, callback );
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
		var datetime = wx.getStorageSync( 'datetime' );
		var type;

		console.log( pageParam );
		//type = caller.data.paytype.indexOf( caller.data.type );
		ajax.query( {
			url : app.host + '/app/order/cart/submit',
			//url : 'https://gateway.hotel.yimeixinxijishu.com/app/order/list',
			param : {
				addressId : 1,
				shopId : pageParam.shopid,
				address : data.pageData.defaultAddress
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

