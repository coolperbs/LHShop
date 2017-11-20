var app = getApp();
var config = require('../../config');
var host = config.host;
var utils = require('../../common/utils/utils');
var ajax = require('../../common/ajax/ajax');
var app = getApp();
Page({
	onShareAppMessage : app.shareFunc,
	onShow:function(){
		console.log('fx-mymoney');
		var self = this;
		_fn.getBalance(self)
		self.setData({
			curTab:"bank"
		})
	},
	changeInput:function(e){
		var self = this;
		var key = e.currentTarget.dataset.key;
		var val = e.detail.value;
		self.formData = self.formData || {};
		if(key==='account'){
			var type = e.currentTarget.dataset.type;
			self.formData.type = type;
			self.formData.carnum = val;
		}else{
			self.formData[key] = val
		}
	},
	submit:function(){
		var self = this;
		_fn.submit(self);
	},
	changetab:function(event){
		var self = this;
		var key = event.currentTarget.dataset.key;
		self.setData({
			curTab :key
		})
	}
});
var _fn = {
	getBalance:function(page){
		ajax.query({
			url:host+'/app/money/info'
		},function(res){
			console.log(res);
			if(res.code === '0000'){
				page.availableGet =  res.data.availableGet || 0
				page.showAvailableGet = utils.fixPrice(page.availableGet);
				page.setData({availableGet:page.showAvailableGet});
			}

		})
	},
	submit:function(page){
		var validateRes = _fn.validate(page);
		if(!validateRes){
			return;
		}
		var formData = page.formData;
		console.log(formData)
		ajax.query({
			url:host+'/app/money/apply',
			param:formData
		},function(res){
			if(res.code='0000'){
				wx.showModal({
					title:'提示',
					content:"提交申请成功,我们会在3-5个工作日为您打账",
					showCancel:false,
					success:function(){
						wx.navigateBack()
					}
				});
			}
		})
	},
	validate:function(page){
		var formData = page.formData;
		var validateRes=true;
		var validateMsg="";
		var availableGet = page.availableGet/100||0;
		switch(true){
			case !formData.price:
				validateRes = false;
				validateMsg = '请输入提款金额';
				formData.price='';
				break;
			case formData.price/1>availableGet:
				validateRes = false;
				validateMsg = '提款金额超出范围';
				formData.price='';
				break;
			case !formData.userName:
				validateRes = false;
				validateMsg = '请输入收款人姓名';
				formData.userName='';
				break;
			case !formData.phoneNumber:
				validateRes = false;
				validateMsg = '请输入联系电话';
				formData.phoneNumber='';
				break;
			case formData.phoneNumber.length !==11:
				validateRes = false;
				validateMsg = '请输正确的手机号码'
				formData.phoneNumber = '';
				break;
			case !formData.carnum:
				validateRes = false;
				validateMsg = '请输入收款账号(银行卡号,微信,支付宝)'
				break;
		}
		if(validateMsg){
			wx.showModal({
				title:'提示',
				content:validateMsg,
				showCancel:false
			});
			page.setData({
				formData:formData
			});
		}
		return validateRes

	}

}