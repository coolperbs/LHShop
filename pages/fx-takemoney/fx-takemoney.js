var app = getApp();
var comfig = ""
Page({
	onShow:function(){
		console.log('fx-mymoney');
		var self = this;
		// _fn.getBalance(self)
		self.setData({
			curTab:"bank"
		})
	},	
	changeMoney:function(event){
		var self = this
		var balance = event.detail.value;
		var submitObj = self.data.submitObj||{};
		submitObj.balance = balance;
		self.setData({
			submitObj:submitObj
		});
	},

	changeMobile:function(event){
		var self = this
		var mobile = event.detail.value;
		var submitObj = self.data.submitObj||{};;
		submitObj.mobile = mobile;
		self.setData({
			submitObj:submitObj
		});
	},
	changeName:function(event){
		var self = this
		var cash_name = event.detail.value;
		var submitObj = self.data.submitObj||{};;
		submitObj.cash_name = cash_name;
		self.setData({
			submitObj:submitObj
		});
	},
	changeTabInput:function(event){
		var self = this;
		var key = event.currentTarget.dataset.key;
		var value = event.detail.value;
		var submitObj = self.data.submitObj||{};
		submitObj[key] = value;
		self.setData({
			submitObj:submitObj
		});
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
	getBalance:function(callerPage){
		let userkey = app.globalData.userKey;
		wx.request({
			url:`${SERVER_BASE}/Mobile/UserApi/getdsalebalance?`,
			method:'GET',
			header: {
				'content-type':'application'
			},
			data:{
				userkey:userkey
			},
			success: function(res){
				callerPage.setData({
					summary:res.data.data

				});
			}
		});
	},
	submit:function(callerPage){
		let userkey = app.globalData.userKey;
		let submitObj = callerPage.data.submitObj;
		var cashtype;
		var cash_user;
		var curTab = callerPage.data.curTab;
		if(curTab === 'bank'){
			cashtype = 0;
			cash_user = submitObj[curTab+'count'];
		}else if(curTab === 'wechat'){
			cashtype = 1;
			cash_user = submitObj[curTab+'count'];
		}else if(curTab === 'zhifubao'){
			cashtype = 2;
			cash_user = submitObj[curTab+'count'];
		}

		var submitParam = {
			cashtype:cashtype,
			cash_user:cash_user,
			cash_name:submitObj.cash_name,
			balance:submitObj.balance,
			userkey:userkey,
			mobile:submitObj.mobile
		}
		wx.request({
			url:`${SERVER_BASE}/Mobile/UserApi/cashbalance?`,
			method:'GET',
			header: {
				'content-type':'application'
			},
			data:submitParam,
			success: function(res){
				if(res.data.error===0){
					wx.showToast({
						title:"提交申请成功"
					});
					_fn.getBalance(callerPage);

				}
			}
		})

	}
}