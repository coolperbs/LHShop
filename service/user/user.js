var handle, CFG, _fn, 
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	uuid = require( '../../common/uuid/uuid' ),
	config = require('../../config'),
	env = config.env,
	url,
	hostTrading = config.host.trading[env],

CFG = {
	storeName : 'userinfo',	//前端key
	tempId : 'tempid'
}

url = {
	login : config.HOST.trading + '/mch/user/wechat/auth/miniProgram'
	//login : 'http://10.12.196.89:8080/login'
}

error = utils.merge( error, {
	loginError : { code : -1001, success : false, msg : '调用小程序登录接口失败，请稍后重试' },	// 
	getWxUserInfoError : { code : -1002, success : false, msg : '调用微信用户信息接口失败，请稍后重试' } // 
} );

handle = {
	// 不带验证获取
	getStoreInfo : function() {
		return wx.getStorageSync( CFG.storeName ) || null;
	},

	isPlus : function() {
		var info = wx.getStorageSync( CFG.storeName ) || {};	
		info = info.user || {};
		return info.type * 1 === 2 ? true : false;
	},

	createTempId : function() {
		var tempId = wx.getStorageSync( CFG.tempId );

		if ( tempId ) {
			return;
		}
		wx.setStorageSync( CFG.tempId, uuid.create() );
	},

	isLogin : function( callback ) {
		var userInfo = wx.getStorageSync( CFG.storeName ) || {};
		if ( !userInfo.token ) {
			callback( false );
			return;
		}
		wx.checkSession( {
			success : function() {
				callback( true );
			},
			fail : function( res ) {
				callback( false );
			}
		} );
	},

	// 带验证获取
	getInfo : function( callback ) {	
		var userInfo = handle.getStoreInfo();
		if ( !userInfo ) { // 没有则从服务器拉取信息
			handle.updateInfo( callback );
			return;
		}

		// 如果失效需要重新登录唤醒微信登录态
		wx.checkSession( {
			success : function() {
				callback && callback( utils.merge( error.success, { data : userInfo } ) );
			},
			fail : function() {
				// 这里是走流程还是直接wx.login就行？
				handle.updateInfo( callback );
			}
		} );
	},

	login : function( callback ) {
		this.updateInfo( callback );
	},

	// 从服务端同步信息
	updateInfo : function( callback ) {
		// 1.登录
		_fn.wxLogin( function( loginInfo ) {
			if ( _fn.isErrorRes( loginInfo ) ) {
				callback && callback( loginInfo );
				return;
			}
			// 2.获取微信侧登录信息
			_fn.getWxUserInfo( function( wxUserInfo ){ 
				if ( _fn.isErrorRes( wxUserInfo ) ) {
					callback && callback( wxUserInfo );
					return;
				}
				// 3.调取服务端数据
				ajax.query( {
					url : url.login,
					param : {
						code : loginInfo.data.code,
						iv : wxUserInfo.data.iv,
						encryptedData : wxUserInfo.data.encryptedData
					}
				}, function( userInfo ) {
					// 保存信息
					if ( userInfo && userInfo.code == '0000' && userInfo.success == true ) {
						_fn.setStoreInfo( userInfo.data );
					}
					callback && callback( userInfo );
				} );
			} );
		} );
	},


	// mine页面业务要去盯下，有个登录逻辑未考虑
	getUserDetail:function(){
		var callback,
			option,
			passNoneToken,//如果接口返回没有token，是否走登陆重新获取
			self = this,
			url = hostTrading+'/mch/user/info';

		if ( arguments.length == 1 && typeof arguments[0] === 'function' ) {
			callback = arguments[0];
		} else if ( arguments.length == 2 ) {
			callback = arguments[1];
			option = arguments[0];
		}
		option = option || {};
		passNoneToken = option.passNoneToken || false;//如果接口返回没有token，是否走登陆重新获取

		ajax.query({
			url:url,
			param:option
		},res=>{
			callback && callback( res );
			return;
			// 先不token失效，后续统一考虑
			// if(res.code === 'GW10005' && !passNoneToken){
			// 	self.getInfo(res=>{
			// 		self.getUserDetail(callback,{
			// 			passNoneToken:true
			// 		});//第二次请求如果还是没有token就不走登陆了
			// 	});
			// }else{
			// 	if(typeof callback === 'function'){
			// 		callback(res);
			// 	}
			// }		
		});
	}

};

_fn = {
	setStoreInfo : function( data ) {
		if ( !data ) {
			return;
		}
		//var data = wx.getStorageSync( CFG.storeName );
		// 目前版本没考虑深度拷贝情况
		// 这里要做个merge避免全部被处理，或者不暴露这个方法
		wx.setStorageSync( CFG.storeName, data );
	},
	wxLogin : function( callback ) {
		wx.login( {
			success : function( res ) {
				callback && callback( utils.merge( error.success, { data : res } ) );
			},
			fail : function() {
				//error.loginError.errorInfo = res; // 先不考虑，上游业务无需关心细节
				callback && callback( utils.merge( error.loginError, { errorInfo : res } ) );
			}
		} );
	},

	// 获取微信侧用户信息
	getWxUserInfo : function( callback ) {
		wx.getUserInfo( {
			success : function( res ) {
				callback( utils.merge( error.success, { data : res } ) );
			},
			fail : function( res ) {
				callback && callback( utils.merge( error.getWxUserInfoError, { errorInfo : res } ) );
			}
		} );
	},

	isErrorRes : function( res ) {
		if ( !res || !res.code === '0000' || !res.data ) {
			return true;
		}
		return false;
	}
}



module.exports = service(handle);