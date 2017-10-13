var handle, events, _fn,
    res = require( './data.js' ),
    utils = require( '../../common/utils/utils' ),
    service = require( '../../service/service' );

handle = {
  render : function( callerPage ) {
    var self = this;
  	_fn.init( callerPage );
    // 获取购物车数据
    service.cart.query({}, function( res ) {
      if ( res.code == '1000' ) {
        wx.navigateTo( {
          url : '../login/login'
        } );
        return;
      }
      if ( utils.isErrorRes( res ) ) {
        return;
      }
      callerPage.setData( {
        viewData : res.data
      } );
      console.log( res );
    });
  }
};

events = {
  goCheck : function( e ) {
    // 判断选中态等情况
    wx.navigateTo( { url : '../checkout/checkout?cartid=' + e.currentTarget.dataset.cartid } );
  }
}

_fn = {
	init : function( callerPage ) {
		if ( callerPage.initedCart ) {
			return;
		}
		utils.mix( callerPage, {
      cartClickProxy : function( e ) {
        var target = e.currentTarget;
        if ( target.dataset && target.dataset.fn && events[target.dataset.fn] ) {
          events[target.dataset.fn].call( this, e );
        }
      }
    } );
		callerPage.initedCart = true;
	},
}

module.exports = handle;