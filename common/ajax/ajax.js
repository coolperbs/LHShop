var config = require('../../config'),
    protocol = config.protocol,
    handle,
    _fn;

handle = {
  query : function( object, callback ) {
    var param = _fn.wrapParam( this, object );
    wx.request({
      //url : protocol + object.url, // 这个组装放这里有问题，如果传入完整地址就会有问题
      url : object.url,
      data : param,
      method : 'get',
      success : function( res ) {
        _fn.responseWrapper( res, callback );
      },
      fail : function( res ) {
        _fn.responseWrapper( res, callback );
      }
    });
  },
  setGlobalParam : function( param ) {
    this.globalParam = param;
  }
}

_fn = {
  wrapParam : function( caller, object ) {
    var userInfo = wx.getStorageSync( 'userinfo' ) || {};
    object.param = object.param || {};
    object.param.venderId = caller.globalParam.uid;
    return {
      param : JSON.stringify( object.param ) || '',
      token : userInfo.token || ''
      // token:'5D3FCC62F01D63E409EA0C82E22DA0D7602948BCF7C1C7DF43ACED7E690DE6DFC11D1782EC546640154DAABC45617B6AB93F8EEA6D1410031367C3762D15CB814C84D8637E95DD8C227952702056056C52317C3EA984F9626A961480F36E7FDF1BA506015E131BF178ABB5FF71434E1AB34309D3DD6B00C9DEA48467052D0EA0'
    };
  },

  responseWrapper : function( res, callback ) {
    if ( !res || res.statusCode != 200 ) {
      callback( {
        errCode : -1,
        msg : '网络问题',
        data : {}
      } );
      return;
    }

    // 一些特殊登录统一拦截，如未登录等情况
    //if ( res.data.errCode == 12341234 ) {
      // 跳转到登录页
    //}
    if ( typeof callback == 'function' ) {
      callback( res.data );
    }
  }
}

module.exports = handle;