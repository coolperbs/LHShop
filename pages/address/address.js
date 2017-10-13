var weigetUtils = require('../../common/utils/weigetUtil');
var Address = weigetUtils.Address;

Page({
	onShow:function(){
		var self = this;
		console.log('address');
		_fn.init(self);
	},
	changeLocation:function(e){
		var self = this;
		console.log(e);
		self.address.change(e);
	}
});
var _fn = {
	init:function(page){
		page.address = new Address({
			// provinceId:'650000',
			// cityId:'654000',
			// countryId:'654026',
			changeCallback:function(data){
				page.setData({location:data});
			}
		});
		page.address.change();
	}
}

