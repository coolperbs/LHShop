var service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	QUERY_TIMMER, COUNT_TIMMER,
	orderId, fn, isJumping = false;


/**
逻辑说明
	1.只有自提订单且状态是已支付后才开始轮训
	2.每个单元格状态，文案，tips由后台返回
	3.已完成订单文案也要轮训，用于显示单元格状态，且由后台将轮训条件置为-1，才停止轮训
	4.开始轮训后，如果后台不是-1则默认轮训，因为有可能后台出错了
**/



//'orderid=10135260'
// orderStatus用于判断订单状态
Page({
	data : {
		//orderId : '10216660',
		currentUnitIndex : 0, // 当前货架状态
		orderStatus : '', // 订单状态
		orderInfo : {},	// 订单信息
		unitInfo : {}
	},
	onLoad : function( param ) {
		orderId = param.orderid || '';
	},
	onShow : function() {
		//fn.queryState( this, 0 );	// 立即修改状态
		fn.renderPage( this );
	},
	onUnload : function() {
		fn.stopQuery();
	},
	onHide : function() {
		fn.stopQuery();
	},



	/*==================	事件	=================*/

	changeTab : function( e ) {
		var index = e.target.dataset.index;
		this.setData( {
			currentUnitIndex : index 
		} );
	},
	pay : function() {
		fn.pay( this );
	},

	jump : function( e ) {
		if ( isJumping ) {
			return; 	// 避免重复点击
		}
		isJumping = true;
		var type = e.currentTarget.dataset.type,
			url;

		switch ( type ) {
			case 'aftersale' :
				url = '../aftersalelist/aftersalelist?orderid=' + orderId;
				break;
			case 'comment' : 
				url = '../comment/comment?orderId=' + orderId;
				break;
		}

		wx.navigateTo( { url : url, complete : function() {
			isJumping = false;
		} } );
	},

	deleteOrder : function() {
		var self = this;
		service.order.delOrder( {
			id : orderId
		}, function( res ) {
			res = res || {};
			if ( res.code !== '0000' || !res.success ) {
				wx.showToast( { title : res.msg } );
				return;
			}
			wx.showModal( {
				title : '提示',
				content : '订单删除成功',
				showCancel : false,
				complete : function() {
					wx.navigateBack();
				}
			} );			
		} );
	},

	// 取消订单
	cancelOrder : function( ) {
		var self = this;

		service.order.cancelOrder({
			orderId:orderId
		}, function( res ) {
			res = res || {};
			if ( res.code !== '0000' || !res.success ) {
				wx.showToast( { title : res.msg } );
				return;
			}
			wx.showToast( { title : '取消成功' } );
			// 刷新页面？
			fn.renderPage( self );
		});		
	},	
});

fn = {
	renderPage : function( caller, callback ) {
		var self = caller;
		fn.renderOrder( self, function() {
			var data = self.data;
			// 开启轮训
			if ( data && data.orderInfo && data.orderInfo.shipmentType == 2 
					&& data.orderInfo.orderStatus >= 16 && data.orderInfo.orderStatus <= 256 ) {	// 自提已支付订单开始轮训，1024是已取消订单
				fn.queryState( self, 0 );
			}
		} );
	},

	renderOrder : function( caller, callback ) {
		var self = caller;

		if ( !orderId ) {
			wx.showToast( { title : '缺少订单id' } );
			return;
		}


		/*
			orderStatus 
			8	: 待支付			取消订单 去支付
			16 	: 待生产(待拣货)	取消订单 待备货
			32	: 生成中(拣货中)	售后
		*/
		service.order.getOrderDetail( { id : orderId }, function( res ) {
			var state;

			if ( !res || res.code !== '0000' ) {
				wx.showToast( { title : res.msg } );
			}
			// 自提订单开启轮训
			self.setData( {
				orderStatus : res.data.orderStatus, 
				orderInfo : fn.format( res.data )
			} );
			callback && callback();
		} );
	},

	queryState : function( caller, time ) {	// 轮训状态

		time = time || 0;
		QUERY_TIMMER = setTimeout( function() {
			service.order.getStatus( { orderId : orderId }, function( res ) {
				res = res;
				res.data = res.data || {};
				var time = res.data.revokeFrequency * 1,
					orderInfo = caller.data || {};
				orderInfo = orderInfo || {};
				fn.renderTips( caller, res.data );
				fn.startCountTime( caller );

				time === -1 ? fn.stopQuery() : fn.queryState( caller, time * 1000 || 3000 );	// 如果出错则3秒请求一次

				if ( res.data.completeStatus == 2 && orderInfo.orderStatus >= 16 && orderInfo.orderStatus < 256 ) {
					fn.renderPage( caller );
					fn.stopQuery();
				}
			} );
		}, time );
	},

	renderTips : function( caller, data ) {
		data = fn.formatTipsData( data );
		caller.setData( {
			unitInfo : data || {}
		} );
		console.log( caller.data );
	},

	formatTipsData : function( data ) {
		if ( !data || !data.taskVos || !data.taskVos.length ) {
			return data;
		}
		var i, t, taskVosKey = {};

		for ( i = 0; t = data.taskVos[i]; ++i ) {
			t.endTime = fn.getEndTime( t.startPickTime, t.timeout, data.sysTime );
			t.tipsClass = fn.getTipsClass( t.pickStatus );
			t.paymentTips = t.paymentTips || '';
			t.tipsArr = t.paymentTips.split( '${remainTime}' );
			if ( t.unitId ) {
				taskVosKey[ t.unitId ] = t;
			}
		}
		data.taskVosKey = taskVosKey;
		return data;
	},

	getTipsClass : function( status ) {
		var tipsClass = {
			0 : 'wait',
			1 : 'work',
			2 : 'finish'
			//3 : 'stop'
		}
		return tipsClass[status] || '';
	},

	// 获取结束时间
	getEndTime : function( startTime, timeout, sysTime  ) {
		// 模拟数据
		//startTime = 1504073340422;
		//timeout = 60 * 50 * 24;// 秒
		//sysTime = new Date().getTime() - 5000;
		if ( !startTime || !timeout || !sysTime ) {
			return null;
		}
		var currentTime = new Date().getTime(),
			interval = currentTime - sysTime;	// 间隔时间

		return Math.round( ( startTime + interval + timeout * 1000 ) / 1000 );
	},

	stopQuery : function() {
		if ( QUERY_TIMMER  ){
			clearTimeout( QUERY_TIMMER );
		}
		fn.stopCountTime();
	},

	startCountTime : function( caller ) {
		if ( COUNT_TIMMER ) {
			return;
		}
		COUNT_TIMMER = setInterval( function() {
			var currentTime = Math.round( new Date().getTime() / 1000 ),
				dots = '·', i;
			for ( i = 0; i < currentTime % 3; ++i ) {
				dots += '·';
			}
			caller.setData( {
				currentTime : currentTime,
				dots : dots
			} );
		}, 1000 );
	},

	stopCountTime : function() {
		clearInterval( COUNT_TIMMER );
	},	

	format : function( data ) {
		var i, len, k, unit, j, sku;
		if ( !data || !data.units ) {
			return data;
		}

		// 单元格处理总数
		for ( i = 0, len = data.units.length; i < len; ++i ) {
			data.units[i].allNum = fn.getNum( data.units[i] );
		}

		// 账户余额
		data.balancePriceStr = utils.fixPrice( data.balancePrice ); 
		// 应付价格
		data.payPriceStr = utils.fixPrice( data.payPrice );

		// 处理商品价格
		for ( k = 0; unit = data.units[k]; ++k ) {
			if ( !unit.wares || unit.wares.length < 1 ) { continue; }
			for ( j = 0; sku = unit.wares[j]; ++j ) {
				sku.promotionSinglePriceStr = utils.fixPrice( sku.promotionSinglePrice );
				sku.payPriceStr = utils.fixPrice( sku.payPrice );
				sku.warePriceStr = utils.fixPrice( sku.warePrice );
				// sku.discount = sku.price == 0 ? 0 : sku.price - sku.originPrice;
				// sku.discountStr= utils.fixPrice( sku.discount );
			}
		}			
		return data;
	},

	getNum : function( unit ) {
		var i, sku, result = 0;

		for ( i = 0; sku = unit.wares[i]; ++i ) {
			result += sku.wareNum;
		}
		return result;
	},


	pay : function( caller ) {
		var orderInfo = caller.data.orderInfo;

		service.trade.pay( {
			orderId : orderInfo.id,
			autoPay : false,
			totalFee : orderInfo.payPrice
		}, function( payRes ) {
			var data;
			if ( !payRes || payRes.code != '0000' ) {
				wx.showToast( { title : payRes.msg } );
				return;
			}
			data = payRes.data || {};
			// 3.唤醒微信支付
			service.trade.wxPay( {
				timeStamp : data.timeStamp,
				nonceStr : data.nonce_str,
				package : 'prepay_id=' + data.prepay_id,
				signType : 'MD5',
				paySign : data.sign					
			}, function( wxRes ) {
				if ( !wxRes || wxRes.code != '0000' ) {
					wx.showToast( { title : wxRes.msg } );
					// 支付订单失效需要刷新当前页面状态
					// 跳转到订单
					return;
				}
				wx.showToast( { title : '支付成功' } );
				fn.renderPage( caller );
				// wx.redirectTo( { url : '../orderdetail/orderdetail?orderid=' + orderId } );
				// 支付订单失效需要刷新当前页面状态
			} );
		} );
	}
}