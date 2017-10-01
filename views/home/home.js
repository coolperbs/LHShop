var service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	jumpUrl,
	handle,	events,	symbol,	pageData, plusInfo,	_fn;

symbol = {
	1 : 'Ⅰ',
	2 : 'Ⅱ',
	3 : 'Ⅲ',
	4 : 'Ⅳ',
	5 : 'Ⅴ',
	6 : 'Ⅵ',
	7 : 'Ⅶ',
	8 : 'Ⅷ',
	9 : 'Ⅸ',
	10 : 'Ⅹ',
	11 : 'Ⅺ',
	12 : 'Ⅻ'
}

jumpUrl = {
	1 : '../active/active',
	2 : '../wallet/wallet',
	3 : '../buyvip/buyvip'
}

handle = {
	name : 'home',
	//data : data.data,
	render : function( callerPage ) {
		wx.setNavigationBarTitle({
			title : '冰象鲜生'
		});
		_fn.init( callerPage );
		// 请求数据，渲染数据
	},

	events : {
		jump : function( caller, e ) {
			console.log( e );
			// type : 1活动 2普通充值 3购买plus
			var data = e.currentTarget.dataset,
				pageData = caller.data.viewData.pageData,
				url, param, i, p, obj = {};


			url = jumpUrl[ data.type ] || url;
			param = data.url || '';
			param = param.indexOf( '?' ) >= 0 ? param.split( '?' )[1] : param;
			param = param.split( '&' );
			for ( i = 0; p = param[i]; ++i ) {
				p = p || '';
				p = p.split( '=' );
				obj[p[0]] = p[1]
			}
			if ( data.type == 1 ) {
				url += url.indexOf( '?' ) >= 0 ? '&' : '?';
				url += 'shopid=' + ( obj['shopid'] || pageData.defaultStoreId ) + '&actid=' + ( obj.actid || '' );
			}
			wx.navigateTo( { url : url } );
		}
	}
}

_fn = {
	init : function( callerPage ) {
		if ( callerPage.initedHome ) {	// 这里要考虑刷新时的变化
			return;
		}
		_fn.renderVip( callerPage );
		_fn.renderPage( callerPage );
	},
	renderPage : function( callerPage ) {
		if ( pageData ) {
			callerPage.setData( {
				'viewData.pageData' : pageData
			} );
			return;
		}
		service.store.getMain( function( res ) {
			if ( res.code != '0000' || !res.success ) {
				wx.showToast( { title : res.msg } );
				return;
			}
			pageData = res.data;
			callerPage.setData( {
				'viewData.pageData' : pageData
			} );
		} );
	},
	renderVip : function( callerPage ) {
		if ( plusInfo && !wx.getStorageSync( 'plusanim' ) ) {
			plusInfo.showAnim = false;
			_fn.setHead( plusInfo );
			callerPage.setData( {
				'viewData.plusInfo' : plusInfo
			} );
			return;
		}
		service.user.getUserDetail( function( res ) {
			// 没获取信息不做处理
			if ( res.code != '0000' || !res.success ) {
				return;
			}
			res.data = res.data || {};
			plusInfo = res.data;
			_fn.saveUserInfo( res.data );
			plusInfo.symbol = symbol;
			plusInfo.showAnim = true;
			//setTimeout( function(){
			_fn.setHead( plusInfo );
			callerPage.setData( {
				'viewData.plusInfo' : plusInfo || {}
			} );
			wx.removeStorageSync( 'plusanim' )
			//}, 2000 );
		} );
	},

	setHead : function( plusInfo ) {
		if ( plusInfo.type == 2 ) {	// 这里要变成全局设置
			wx.setNavigationBarColor({
				backgroundColor : '#161823',
				frontColor : '#ffffff',
				animation : {
					duration : 500
				}
			});
		} else {
			wx.setNavigationBarColor({
				backgroundColor : '#ffffff',
				frontColor : '#000000',
				animation : {
					duration : 500
				}
			});
		}
	},

	saveUserInfo : function( data ) {
		if ( !data ) {
			return;
		}

		var userInfo = wx.getStorageSync( 'userinfo' ) || {};
		userInfo.user = data;
		wx.removeStorageSync( 'userinfo' );	// 避免一些没有的key不能删除掉
		wx.setStorageSync( 'userinfo', userInfo );
	}
}

module.exports = handle;