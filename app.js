//var user = require( 'service/user/user' );
//var uuid = require( 'common/uuid/uuid' );
var config = require( './config' );
var weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
var _fn;
var ajax = require( './common/ajax/ajax' );


var conf = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

conf.host = conf.host || config.host;
conf.appid = conf.appid || 'wxaccdda8d2e9e827e';
conf.secret = conf.secret || '60088a714462ddd6fb59bb7b8bbe2a1c';
conf.title = conf.title || '商城';
conf.uid = conf.cid || 2274;
conf.actHost = config.actHost;

ajax.setGlobalParam( conf );

var handle = {
	//host : 'https://hotelgateway.yimeixinxijishu.com',
	host : conf.host,
	actHost : conf.actHost,
	config : conf,
	shareFunc : function() {
		var upperuid = wx.getStorageSync( 'upperuid' ),
			url = 'pages/index/index';

		if ( upperuid ) {
			url += '?upperuid=' + upperuid
		}
		return {
			title : conf.title,
			path : url
		}
	},
	globalData:{
		evt:"dev"//使用环境
	},
	onShow:function( options ){
		var scene = options.scene,
			query = options.query,
			upperuid = query.upperuid,
			str;

		scene = scene ? scene + '' : '';
        if ( scene.indexOf( 'upperuid_' ) == 0 ) {
            str = options.scene.split( '_' );
            upperuid = str[1] || '';
        }		

        upperuid = wx.getStorageSync( 'upperuid' ) || upperuid;
        wx.setStorageSync( 'upperuid', upperuid );
        this.bindUpperUid();
		// _fn.setDate();
		// _fn.setCity();
		// _fn.getLocation();
	},
	bindUpperUid : function() {
		var hasBind = wx.getStorageSync( 'hasBind' ),
			upperuid =wx.getStorageSync( 'upperuid' ),
			userInfo = wx.getStorageSync( 'userinfo' ) || {};

		if ( !upperuid || !userInfo || !userInfo.token ) {
			return;
		}

		if ( hasBind ) {
			return;
		}

		// upperuid是自己的情况，自己成为分销商就能分享了
		// if ( userInfo && userInfo.user && userInfo.user.id == upperuid  ) {
		// 	wx.removeStorageSync( 'upperuid' );
		// 	return;
		// }
		ajax.query( {
			url : this.host + '/app/binding',
			param : {
				ParentUserId : upperuid
			}
		}, function( res ) {
			if ( res.code == '0000' || res.code == '1003' ) {
				wx.setStorageSync( 'hasBind', true );
			}
		} );
	}
};

_fn = {
}

App( handle );

