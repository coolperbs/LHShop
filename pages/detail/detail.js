var ajax = require( '../../common/ajax/ajax' ),
	service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
	pageParam,
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
		// this.showPop();
		// return;
		// 如果没有规格参数 就直接加购
		service.cart.add( {
			skuId : pageData.skuId
		}, function( e ) {
			if ( e.code == '1000' ) {
				wx.navigateTo( {
					url : '../login/login'
				} );
				return;
			}

			wx.showToast( { title : '添加成功!' } );
		} );
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