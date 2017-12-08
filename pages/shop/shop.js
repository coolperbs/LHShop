var ajax = require( '../../common/ajax/ajax' ),
	utils = require( '../../common/utils/utils' ),
	modules = require( '../../widgets/modules/modules.js' ),
	service = require( '../../service/service.js' ),
	app = getApp(),
	currentPage = 0,
	hasMore = true,
	pageParam,
	isGetMore = false,
	_fn;

Page( {
	onShareAppMessage : app.shareFunc,
	onLoad : function( options ) {
		var scene = options.scene || '';

		pageParam = options || {};
		scene = decodeURIComponent( scene );
		if ( scene.indexOf( 'shopid_' ) == 0 ) {
			pageParam.shopid = scene.split( '_' )[1];
		}
		//app.scene = ''; // 使用之后立即清空
		_fn.getStoreInfo( this );
		_fn.changeTab( this, { index : 1, name : 'home' } );
	},
	onShow : function() {
	},
	changeTab : function( e ) {
		var data = e.currentTarget.dataset;

		_fn.changeTab( this, data );
	},
	moduleClickProxy : function( e ) {
		var target = e.currentTarget;
		if ( target.dataset && target.dataset.fn && modules.events[target.dataset.fn] ) {
		  modules.events[target.dataset.fn].call( this, e );
		}
    },
    getMore : function() {
    	var data = this.data;
    	if ( !hasMore || isGetMore || data.tab.currentTab.name == 'home' ) {
    		return;
    	}
    	isGetMore = true;
    	_fn.search( this, {
    		currentPage : currentPage + 1
    	} );
    },
    follow : function( e ) {
		var self = this,
			data = self.data,
			param,
			favoriteId = data.shopInfo.favoriteId;

		param = {
			type : 2,
			shopId : data.shopInfo.id
		}

		if ( favoriteId ) {
			param.favoriteId = favoriteId;
		}

		_fn.follow( param, function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}

			_fn.getStoreInfo( self );
			// self.setData( {
			// 	'shopInfo.favoriteId' : res.data.favoriteId || ''
			// } );
		} );    	
    }
} );

_fn = {
	follow : function( param, callback ) {
		param = param || {};
		ajax.query( {
			url : app.host + '/app/favorite',
			param : param
		}, callback );
	},	
	changeTab : function( caller, tabInfo ) {
		//currentPage = 1;// 切到第一页
		hasMore = true;		
		caller.setData( {
			'tab.currentTab' : tabInfo
		} );
		_fn['get' + tabInfo.name]( caller );
	},

	getStoreInfo : function( caller ) {
		ajax.query( {
			param : { storeId : pageParam.shopid },
			url : app.host + '/app/store/info'
		}, function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			res.data = res.data || {};
			caller.setData( {
				shopInfo : res.data.store || {}
			} );
		} );
	},

	gethome : function( caller ) {
		utils.showLoading( 300 );
		service.active.getShop( {
			shopId : pageParam.shopid
		}, function( res ) {
			utils.hideLoading();
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			caller.setData( {
				pageData : res.data || {},
				scrollTop : 0
			} );
		} );
	},

	getall : function( caller ) {
		_fn.search( caller, { 
			currentPage : 1
		} );
	},

	getnew : function( caller ) {
		_fn.search( caller, { 
			currentPage : 1
		} );		
	},

	search : function( caller, param ) {
		var data = caller.data;

		param = param || {};
		param.currentPage = param.currentPage || 1;
		param.shopId = pageParam.shopId || data.shopInfo.id;
		if ( data.tab && data.tab.currentTab && data.tab.currentTab.name == 'new' ) {
			param.publishDateSort = 1;
		} else if ( data.tab && data.tab.currentTab && data.tab.currentTab.name == 'all' ) {
			param.saleSort = 2;
		}

		utils.showLoading( 300 );
		ajax.query( {
			url : app.host+'/app/ware/search',
			param : param
		}, function( res ) {
			utils.hideLoading();
			isGetMore = false;
			var wareSkus, newData;
			if ( utils.isErrorRes( res ) ) {
				return;
			}
			// 不在当前页
			if ( ['new', 'all'].indexOf( data.tab.currentTab.name ) < 0 ) {
				return;
			}

			currentPage = res.data.currentPage;
			//hasMore = true;
			hasMore = res.data.hasMore;
			if ( param.currentPage != 1 ) {
				wareSkus = caller.data || {};
				wareSkus = wareSkus.pageData || {};
				wareSkus = wareSkus.moduleList || [];
				wareSkus = wareSkus[0] || {};
				wareSkus = wareSkus.data || {};
				wareSkus = wareSkus.wareSkus || [];
			} else {
				wareSkus = [];
			}
			res.data = res.data || {};
			res.data.wareSkus = res.data.wareSkus || [];
			wareSkus = wareSkus.concat( res.data.wareSkus );
			newData = {
				pageData : {
					moduleList : [{
						modulePrototypeId : 1,
						templatePrototypeId : 2,
						data : {
							wareSkus : wareSkus
						}					
					}]
				}
			}
			if ( param.currentPage == 1 ) {
				newData.scrollTop = 0;
			}
			caller.setData( newData );
		} );
	}
}








