var ajax = require( '../../common/ajax/ajax' ),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
	pageParam,
	buyType = 1, // 1为购物车购买，2为直接购买
	_fn;

Page({
	data : {
		pop : {
			show : false
		},
		tab : {
			current : 'imgs'
		}
	},
	onLoad : function( param ) {
		pageParam = param || {};
	},
	onShow : function() {
		var self = this;
		buyType = 1; // 默认为购物车购买
		_fn.getPageData( function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			self.setData( {
				pageData : res.data
			} );
		} );
	},

	// 添加购物车
	addCart : function( e ) {
		var pageData = this.data.pageData;
		buyType = 1;
		this.showPop();
		// 如果没有规格参数 就直接加购
		return;
	},

	buyNow : function() {
		var pageData = this.data.pageData;
		buyType = 2;
		this.showPop();
		// 如果没有规格就直接购买
		return;
	},

	submit : function() {
		var pageData = this.data.pageData || {};
		
		this.hidePop();
		if ( !pageData.skuId ) {
			wx.showToast( {
				title : '缺少skuId'
			} );
			return;
		}

		if ( buyType == 2 ) {	// 立即购买
			wx.navigateTo( {
				url : '../checkout/checkout'
			} );
		} else if ( buyType == 1 ) { //加购
			service.cart.addOut( {
				skuId : pageData.skuId
			}, function( res ) {
				if ( res.code == '1000' ) {
					wx.navigateTo( { url : '../login/login' } );
					return;
				}
				if ( utils.isErrorRes( res ) ) {
					return;
				}
				wx.showToast( { title : '添加成功!' } );
			} );
		}
	},
	showPop : function() {
		this.setData( {
			'pop.show' : true
		} );
	},
	hidePop : function() {
		this.setData( {
			'pop.show' : false
		} );
	},
	changeTab : function( e ) {
		var data = e.currentTarget.dataset;
		this.setData( {
			'tab.current' : data.id
		} );
	}
});

_fn = {
	getPageData : function( callback ) {
		ajax.query( {
			url : app.host + '/app/ware/detail/' + pageParam.id
		}, callback );
	}	
}