var service = require( '../../service/service' ),
	fn;

Page({
	data : {
		region : {
			show : false,
			name : '',
			data : []
		},
		address : {}
	},
	onShow : function() {
		var cacheData = service.address.cache(),
			addressInfo, sysInfo, SDKVersion, regionList;

		sysInfo = wx.getSystemInfoSync();
		SDKVersion = sysInfo.SDKVersion || '1.0.0';

		addressInfo = fn.format( cacheData );
		regionList = [addressInfo.provinceName, addressInfo.cityName, addressInfo.areaName];
		// if ( regionList[0] == regionList[1] ) {	// 过滤北京市北京市东城区这种情况
		// 	regionList.shift();
		// }
		this.setData( {
			region : {
				show : SDKVersion >= '1.4.0', // 走字符匹配也行
				data : regionList,
				name : regionList.join( ' ' ).trim()
			},
			address : addressInfo
		} );
		console.log( this.data );
	},
	changeCity : function( e ) {
		var list = e.detail.value || [];
		this.setData( {
			'region.data' : list,
			'region.name' : list.join( ' ' )
		} );
	},
	submit : function( e ) {
		var data = e.detail.value,
			sysInfo, SDKVersion,
			res;
		sysInfo = wx.getSystemInfoSync();
		SDKVersion = sysInfo.SDKVersion || '1.0.0';

		if ( SDKVersion >= '1.4.0' ) {
			data.addressName = data.provinceName + '' + ( ( data.cityName != data.provinceName && data.cityName != '县' ) ? data.cityName : '' ) + '' + data.areaName;
		}
		res = fn.checkData( data );
		if ( !res.status ) {
			wx.showToast( { title : res.msg } );
			return;
		}

		service.address.update( data, function( res ) {
			if ( !res || res.code != '0000' ) {
				wx.showToast( { title : res.msg } );
				return;
			}
			wx.navigateBack();
		} );
	}
});

fn = {
	format :function( addressInfo ) {
		var result;

		result = {
			id : addressInfo.id || '',
			consignee : addressInfo.consignee || '',
			mobilePhone : addressInfo.mobilePhone || '',
			provinceName : addressInfo.provinceName || '',
			cityName : addressInfo.cityName || '',
			areaName : addressInfo.areaName || '',
			addressName : addressInfo.addressName || '',
			addressDetail : addressInfo.addressDetail || ''
			//latitude : addressInfo.latitude || '',
			//longitude : addressInfo.longitude || ''
		}		
		return result;
	},
	checkData : function( data ) {
		var msg = '';

		switch ( true ) {
			case data.consignee.trim() == '' : 
				msg = '请天填写收件人';
				break;
			case data.mobilePhone.trim() == '' : 
				msg = '请填写手机号码';
				break;
			case !/^1[34578]\d{9}$/.test( data.mobilePhone ) : 
				msg = '请填写正确的手机号';
				break;
			case ( !data.provinceName || !data.cityName || !data.areaName ) 
				&& ( !data.addressName || data.addressName.trim() == '' ) : 
				msg = '请填写省市区';
				break;
			case data.addressDetail.trim() == '' : 
				msg = '请填写详细地址';
				break;
		}

		return msg ? { status : false, msg : msg } : { status : true };
	}
}