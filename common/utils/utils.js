var handle,
    sysInfo = wx.getSystemInfoSync(),
    navigateLock = false,//wx.navigateTo锁，防止重复点击false允许点击 true不允许点击
    loadingTimmer;

handle = {
  merge : function( r, s ) {
    var result = {}, p;

    for ( p in r ) {
      result[p] = r[p];
    }
    for ( p in s ) {
      result[p] = s[p]
    }
    return result;
  },
  mix : function( r, s ) {
    var p;
    for ( p in s ) {
      r[p] = s[p];
    }
    return r;
  },
  toPx : function( num ) {
  	return num / ( 750 / sysInfo.windowWidth )
  },
  toRpx : function( num ) {
  	return num * 750 / sysInfo.windowWidth;
  },
  checkRes : function( res ) {
    res = res || {};
    if ( res.code != '0000' || !res.success ) {
      wx.showToast( { title : res.msg || '系统错误', image : '' } );  // 需要一个错误图片
      return false;
    }
    return true;
  },
  fixPrice : function( price ) {
    price = price || 0;
    price = price / 100;
    price += '';
    if ( price.lastIndexOf( '.' ) == -1 ) {
      return price + '.00';
    } else if ( price.length - price.lastIndexOf( '.' ) == 2 ) {
      return price + '0';
    }
    return price;
  },
  showToast : function( param, time ) {
    if ( time && time > 0 ) {
      setTimeout( function() {
        wx.showToast( param );
      }, time );
      return;
    }
    wx.showToast( param );
  },
  showLoading : function() {
    var param, time;
    if ( arguments.length == 1 ) {
      param = {};
      time = arguments[0];
    } else {
      param = arguments[0] || {};
      time = arguments[1];
    }
    param.title = param.title || '加载中...';
    if ( time && time > 0 ) {
      loadingTimmer = setTimeout( function() {
        wx.showLoading( param );
      }, time );
      return;
    }

    wx.showLoading( param );
  },
  hideLoading : function() {
    clearTimeout( loadingTimmer );
    wx.hideLoading();
  },
  navigateTo:function(param){
    navigateLock = navigateLock || false;
    if(navigateLock){
      return;
    }
    var url = param.url
    if(!url){
      return;
    }
    navigateLock = true;
    wx.navigateTo({
      url:url,
      complete:function(res){
        navigateLock = false;
        if(typeof param.complete === 'function'){
          param.complete(res);
        }
      },
      success:function(res){
        navigateLock = false;
        if(typeof param.success === 'function'){
          param.success(res);
        }
      },
      fail:function(res){
        navigateLock = false;
        if(typeof param.fail === 'function'){
          param.fail(res);
        }

      }
    });

  }
}

module.exports = handle;