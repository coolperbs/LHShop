var handle, events, _fn,
    ajax = require( '../../common/ajax/ajax' ),
    utils = require( '../../common/utils/utils' ),
    app = getApp();

handle = {
  render : function( callerPage, options ) {
    _fn.init( callerPage );

    if ( options.type == 'show' && callerPage.data && callerPage.data.viewData && callerPage.data.viewData.currentTab ) {
      return;
    }
    // 获取购物车数据
    _fn.getViewData( function( res ) {
      var data = callerPage.data,
          newData = {
        'viewData.cat' : res.data
      };
      //if ( options.type == 'changeTab' ) {
        newData['viewData.currentTab'] = res.data[0]
      //} else if ( options.type == 'show' ) {
      //  newData['viewData.currentTab'] = ( data && data.viewData && data.viewData.currentTab ) ? data.viewData.currentTab : res.data[0]
      //}
      callerPage.setData( {
        'viewData.cat' : res.data,
        'viewData.currentTab' : res.data[0]
      } );
    } );
  }
};

events = {
  changeTab : function( e ) {
    var dataset = e.currentTarget.dataset,
        callerPage = this,
        viewData = callerPage.data.viewData,
        id = dataset.id,
        i, len;

    for ( i = 0, len = viewData.cat.length; i < len; ++i ) {
      if ( id == viewData.cat[i].catId ) {
        callerPage.setData( {
          'viewData.currentTab' : viewData.cat[i]
        } );
        return;
      }
    }
    // 判断选中态等情况
    //wx.navigateTo( { url : '../checkout/checkout?cartid=' + e.currentTarget.dataset.cartid } );
  }
}

_fn = {
  init : function( callerPage ) {
    if ( callerPage.initedCategory ) {
      return;
    }
    utils.mix( callerPage, {
      categoryClickProxy : function( e ) {
        var target = e.currentTarget;
        if ( target.dataset && target.dataset.fn && events[target.dataset.fn] ) {
        console.log( e );
          events[target.dataset.fn].call( this, e );
        }
      }
    } );
    callerPage.initedCategory = true;
  },
  getViewData : function( callback ) {
    ajax.query( {
      url : app.host + '/cat'
    }, callback );
  }
}

module.exports = handle;





