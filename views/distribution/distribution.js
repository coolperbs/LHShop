var ajax = require( '../../common/ajax/ajax' ),
	utils = require( '../../common/utils/utils' ),
	app = getApp(),
	handle,
	events,
	_fn;

handle = {
	render : function( callerPage ) {
		_fn.init( callerPage );

		var userInfo = wx.getStorageSync( 'userinfo' ) || {};
		_fn.getPageData( callerPage );
	}
}

events = {
	beAgent : function( e ) {
		var phone = e.detail.value.phone,
			caller = this;

		if ( ( phone + '' ).trim() == '' ) {
			wx.showToast( { title : '请填写手机号' } );
			return false;
		}	
		if( !(/^1[34578]\d{9}$/.test( phone )) ){ 
        	wx.showToast( { title : '请填写正确的手机号' } );  
        	return false; 
    	} 		
    	utils.showLoading( 300 );	
		ajax.query( {
			url : app.host + '/app/applyTrader',
			param : {
				phone : phone
			}
		}, function( res ) {
			utils.hideLoading();
			if ( utils.isErrorRes( res ) && res.code != '1002' ) {
				return;
			}
			_fn.getPageData( caller );
		} );
	},
	goLogin : function() {
		wx.navigateTo( { url : '../login/login' } );
	},
	saveimg : function() {
		var data = this.data;
		wx.getImageInfo( {
		  src : data.viewData.traderInfo.qrcurl,
		  success : function( res ) {
		    wx.saveImageToPhotosAlbum( {
		      filePath : res.path,
		      success : function() {
		        wx.showToast( { title : '保存成功' } );
		      },
		      fail : function() {
		        wx.previewImage( {
		          urls : [data.viewData.traderInfo.qrcurl]
		        } );
		      }
		    } );
		  },
		  fail : function() {
		    wx.previewImage( {
		      urls : [data.viewData.traderInfo.qrcurl]
		    } );
		  }
		} );
	}
}

_fn = {
	getPageData : function( caller, callback ) {
		ajax.query( {
			url : app.host + '/app/traderInfo'
		}, function( res ) {
			var userInfo = wx.getStorageSync( 'userinfo' ) || {};
			if ( utils.isErrorRes( res ) ) {

				callerPage.setData( {
					'viewData.userInfo' : userInfo.user || {},
					'viewData.isBind' : false,
					'viewData.config' : app.config
				} );
				return;
			}
			caller.setData( {
				'viewData.userInfo' : userInfo.user || {},
				'viewData.traderInfo' : res.data,
				'viewData.config' : app.config,
				'viewData.isBind' : true
			} );
		} );
	},
	init : function( callerPage ) {
		if ( callerPage.initedHome ) {
			return;
		}
		utils.mix( callerPage, {
	      distribitionClickProxy : function( e ) {
	        var target = e.currentTarget;
	        if ( target.dataset && target.dataset.fn && events[target.dataset.fn] ) {
	          events[target.dataset.fn].call( this, e );
	        }
	      }
	    } );
	    callerPage.initedHome = true;
	}
}

module.exports = handle;