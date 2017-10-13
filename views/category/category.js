var handle, events, _fn,
    ajax = require( '../../common/ajax/ajax' ),
    utils = require( '../../common/utils/utils' ),
    app = getApp();

handle = {
  render : function( callerPage ) {
    _fn.init( callerPage );
    // 获取购物车数据
    _fn.getViewData( function( res ) {
      if ( utils.isErrorRes( res ) ) {
        return;
      }
      console.log( res );
      callerPage.setData( {
        'viewData.cat' : res.data
      } );
    } );
  }
};

events = {
  goCheck : function( e ) {
    // 判断选中态等情况
    //wx.navigateTo( { url : '../checkout/checkout?cartid=' + e.currentTarget.dataset.cartid } );
  }
}

_fn = {
  init : function( callerPage ) {
    if ( callerPage.initedCart ) {
      return;
    }
    utils.mix( callerPage, {
      categoryClickProxy : function( e ) {
        var target = e.currentTarget;
        if ( target.dataset && target.dataset.fn && events[target.dataset.fn] ) {
          events[target.dataset.fn].call( this, e );
        }
      }
    } );
    callerPage.initedCart = true;
  },
  getViewData : function( callback ) {
    ajax.query( {
      url : app.host + '/cat'
    }, callback );
  }
}

module.exports = handle;





