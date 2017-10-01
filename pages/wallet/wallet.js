var _fn,
utils = require( '../../common/utils/utils' ),
service = require( '../../service/service' ),
chargeService = service.charge,
userService = service.user;


Page({
	/**
*页面的初始数据
*/
	data:{
		selectChargeId:1,
		submitLoading:false,//重置
		toggleCharge:false//打开关闭充值
	},

	/**
*生命周期函数--监听页面加载
*/
	onShow:function(options){
		var self = this;
		_fn.renderUserDetail(self);
		_fn.renderChargeList(self);
		
	},
	
	changeCharge:function(event){//切换充值金额
		var self = this;
		var id=event.currentTarget.dataset.id;
		var chargeList = self.data.chargeList;
		var selectCharge = chargeList.filter((v,k)=>{
			return v.id === id;
		});
		this.setData({
			selectCharge:selectCharge[0]
		});


	},
	pay:function(){
		var self = this;
		var isSubmitLoading = self.data.isSubmitLoading;
		if(isSubmitLoading){
			return;
		}
		self.setData({
			submitLoading:true
		});
		service.user.isLogin( function( isLogin ) {
			if ( !isLogin ) {//用户未登陆授权，跳转授权页
				utils.hideLoading();
				wx.navigateTo( { url : '../login/login' } );
				return;
			}else{
				_fn.pay(self);
			}
			
		});
		setTimeout(function(){
			self.setData({
				submitLoading:false
			});
		},1500);
		
	},
	toConsumeList:function(){
		wx.navigateTo({
			url:'../consumelist/consumelist'
		});

	},
	toggleCharge:function(){
		var self=this;
		self.setData({
			toggleCharge:!self.data.toggleCharge
		});

	}

});
_fn={
	getChargeList:function(callback){
		chargeService.getChargeList({},res=>{
			if(res.code==='0000' && typeof callback === 'function'){
				callback(res)
			}
		});
	},
	getUserDetail:function(callback){
		userService.getUserDetail(res=>{
			if(typeof callback === 'function'){
				callback(res)
			}
		})
	},
	pay:function(caller){
		var selectCharge = caller.data.selectCharge;
		var totalFee = selectCharge.totalFee;
		var id = selectCharge.id;
		utils.showLoading()
		chargeService.payCharge({
				ruleId:id,
				totalFee:totalFee
		},res => {
			utils.hideLoading();
			if(res.code==="0000"){//允许发起支付
				var resData = res.data;
				service.trade.wxPay( {
					timeStamp : resData.timeStamp,
					nonceStr : resData.nonce_str,
					package : 'prepay_id=' + resData.prepay_id,
					signType : 'MD5',
					paySign : resData.sign					
				}, function( wxRes ) {
					console.log('支付完成'+wxRes);
					if ( !wxRes || wxRes.code != '0000' ) {
						wx.showModal({
							title:'提示',
							content:'抱歉，充值失败',
							showCancel:false
						});
					}else{
						wx.showModal({
							title:'提示',
							content:'恭喜，充值成功',
							showCancel:false
						});
						_fn.renderUserDetail(caller);
					}
				} );
			}else if(res.code === 'GATEWAY10005'){
				userService.getInfo(res=>{
					caller.pay();
				});
			}else{
				wx.showModal({
					title:'提示',
					content:res.msg
				});
			}
		});
	},
	renderChargeList:function(callerPage){
		_fn.getChargeList(res=>{
			if(res.code === '0000'){
				var chargeList = [];
				res.data.forEach((v,k)=>{
					chargeList.push({
						id:v.id,
						totalFee:v.balance,
						price:v.balance/100,
						give:v.realBalance>v.balance?(v.realBalance-v.balance)/100:null
					});
				});
				callerPage.setData({
					chargeList:chargeList,
					selectCharge:chargeList[0]
				});

			}
		});
	},
	renderUserDetail:function(callerPage){
		_fn.getUserDetail(res=>{
			var balance = 0;
			if(res.code === '0000'){
				var balance = res.data.balance.balance || 0;
			}
			callerPage.setData({
				user:{
					balance:(balance/100).toFixed(2)
				},
				balance:(balance/100).toFixed(2)
			});
			_fn.renderBalance(callerPage);	

		});
	},
	renderBalance:function(callerPage){
		var balanceStr = callerPage.data.balance.toString()||'';
		var balanceNum = balanceStr.split('');
		callerPage.setData({
			balanceNum:balanceNum,
			balanceAnimate:false
		});
		setTimeout(function(){
			callerPage.setData({
				balanceAnimate:true,
				// balanceStyle:'top:'+balanceNum*90+'rpx'
			});
		},1000)


	}
};