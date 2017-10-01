var handle,
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	config = require('../../config'),
	env = config.env,
	hostTrading = config.host.trading[env],
	hostAppGateWay = config.host.appGateWay[env];
handle = {
	getOrderAftersales:{
		url:hostTrading+'/mch/aftersale/orderInfo'
	},
	submit:{
		url:hostTrading+'/mch/aftersale/submit'

	},
	getReasons:{
		url:hostTrading+'/mch/aftersale/reason'
	},
	getSkuAfersale:{
		url:hostTrading+'/mch/aftersale/wareInfo'
	},
	upload:function(param,callback){
		var orderId = param.orderId;
		var filePath = param.filePath;//string
		var url = hostAppGateWay+'/app/image/upload';
		var userInfo = wx.getStorageSync( 'userinfo' ) || {};
		wx.uploadFile({
			url:url,
			filePath:filePath,
			name:'uploadFile',
			header:{ "Content-Type": "multipart/form-data" },
			formData:{
				param:JSON.stringify({
                    orderId: orderId
                }),
                token:userInfo.token||''
			},
			success:function(res){
				var resData = JSON.parse(res.data);
				if(!resData.success	|| resData.code!=='0000'){
					wx.showModal({
						title:'错误',
						content:'抱歉,上传失败',
						showCancel:false
					});
				}
				if(typeof callback==='function'){
					callback(resData);
				}
			}
		});
	}

}


module.exports = service(handle);