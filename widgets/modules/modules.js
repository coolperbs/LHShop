var utils = require( '../../common/utils/utils.js' ),
	service = require( '../../service/service' ),
	events,
	_fn,
	handle;

handle = {}

handle.events = {
	jumpDetail : function( e ) {
		var id = e.currentTarget.dataset.id;
		if ( !id ){
			return;
		}
		wx.navigateTo( { url : '../detail/detail?id=' + id } );
	},

	showShops : function( e ) {
		this.setData( {
			'viewData.showShops' : !this.data.viewData.showShops
		} );
	},

	jumpUrl : function( e ) {
		var jumpType  = e.currentTarget.dataset.type,
			jumpCont = e.currentTarget.dataset.content,
			url, stacks;

		switch( jumpType * 1 ) {
			case 1 : // 不跳转
				url = '';
				break;
			case 2 : // 跳链接，需要写死小程序相对链接 url
				url = jumpCont;
				break;
			case 3 : // 商详 skuid
				url = '../detail/detail?id=' + jumpCont;
				break;
			case 4 : // 添加购物车, skuid
				_fn.addOut( this, jumpCont );
				url = '';
				break;
			case 5 : // 活动页面 actid
				url = '../active/active?actid=' + jumpCont;
				break;
			case 6 : // 优惠券 shopId，门店内的活动跳优惠券需要传入门店id
				url = '../coupon-fetch/coupon-fetch?shopId=' + jumpCont;
				break;
			case 7 : // 搜索 key
				url = '../search/search?key=' + jumpCont;
				break;
			case 8 : // 跳店铺 shopid
				url = '../shop/shop?shopid=' + jumpCont;
				break;
		}

		if ( !url ) {
			return;
		}
		stacks = getCurrentPages();
		if ( ( jumpType == 3 || jumpType == 5 || jumpType == 8 ) && stacks.length >= 4 ) {
			wx.redirectTo( { url : url } );
		} else {
			wx.navigateTo( { url : url } );
		}
	},

	addCart : function( e ) {
		var id = e.currentTarget.dataset.id;
		if ( !id ) {
			return;
		}
		_fn.addOut( this, id );
	}	
}

_fn = {
	addOut : function( caller, id ) {
		service.cart.addOut( caller, {
			skuId : id
		}, function( res ) {
			if ( res.code == '1000' ) {
				wx.navigateTo( {
					url : '../login/login'
				} );
				return;
			}
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			wx.showToast( { title : '添加成功!' } );
		} );
	}
}

module.exports = handle;