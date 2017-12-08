var weigetUtils = require('../../common/utils/weigetUtil');
var List = weigetUtils.List;
var config = require('../../config');
var host = config.host;
var ajax = require('../../common/ajax/ajax');
var addressService = require('../../service/address/address');
var app = getApp();

Page({
	onShareAppMessage : app.shareFunc,
	onLoad:function(option){
		var self = this;
		// _fn.init(self);
	},
	onShow:function(){
		var self = this;
		_fn.init(self);
	},
	toAddress:function(e){
		wx.navigateTo({
			url:'../address/address'
		})
	},
	toModify:function(e){
		var self = this;
		var addressid = e.currentTarget.dataset.addressid;
		var updateData = self.data.address.filter((v,k)=>{
			return v.addressId === addressid;
		})[0];
		console.log(9999,updateData);
		addressService.cache(updateData);
		wx.navigateTo({
			url:'../address/address?addressId='+addressid
		});
	},
	update:function(e){
		var self = this;
		var key = e.currentTarget.dataset.key;
		var addressId = e.currentTarget.dataset.addressid;
		var updateData = self.data.address.filter((v,k)=>{
			return v.addressId === addressId;
		})[0];
		if(key === 'defaulted'){
			if(updateData.defaulted === 1){
				updateData.defaulted = 2
			}else{
				updateData.defaulted = 1
			}
		}
		_fn.updateAddress(updateData,function(res){
			self.listWeiget.next();
		});
	},
	delete:function(e){
		var self = this;
		var key = e.currentTarget.dataset.key;
		var addressId = e.currentTarget.dataset.addressid;
		_fn.deleteAddress({addressId:addressId},function(res){
			self.listWeiget.next();
		});

	}
});
var _fn = {
	init:function(page){
		page.listWeiget = page.listWeiget || new List({
			url:host+'/app/address/list',
			isSingle:true,
			render:function(data){
				page.setData({
					address:data.totalData
				});
			},
			getList:function(res){
				return res.data;

			},
			getHasMore:function(res){
				return false
			}
		});
		page.listWeiget.next();
	},
	deleteAddress:function(data,callback){
		var url = host + '/app/address/delete/';
		var addressId = data.addressId;
		wx.showModal({
			title:'提示',
			content:'确定要删除这个地址么?',
			complete:function(res){
				if(res.confirm){
					ajax.query({
						url:url,
						param:{addressId,addressId}
					},function(res){
						if(res.code === '0000'){
							wx.showToast({
								title:'修改成功'
							});
							if(callback && typeof callback === 'function'){
								callback(res);
							}
						}else{
							wx.showMadal({
								showCancel:false,
								title:'提示',
								content:'修改失败('+res.code+')'
							})
						}
					})	
				}

			}
		})

	},
	updateAddress:function(data,callback){
		var url = host + '/app/address/update';
		var param = data;
		ajax.query({
			url:url,
			param:param
		},function(res){
			if(res.code === '0000'){
				wx.showToast({
					title:'修改成功'
				});
				if(callback && typeof callback === 'function'){
					callback(res);
				}
			}else{
				wx.showMadal({
					showCancel:false,
					title:'提示',
					content:'修改失败('+res.code+')'
				})
			}
		})
	}
}