var _fn;
var utils = require( '../../common/utils/utils' );
var config = require('../../config');
var host = config.host;
var ajax = require('../../common/ajax/ajax');


Page({
	/**
*页面的初始数据
*/
	data:{
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
		wx.getStorage({
			key:'userinfo',
			success:function(res){
				console.log(res);
				var userinfo = res.data.user;
				if(!userinfo){
					wx.navigateTo({
						url:'../../pages/login/login'
					})
				}else{
					_fn.pay(self);
				}
			}
		});
		
	},
	toConsumeList:function(){
		utils.navigateTo({
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
		var url = host+"/app/recharg/card"
		ajax.query({
			url:url
		},function(res){
			console.log(res)
			callback(res);
		})
	},
	getUserDetail:function(callback){
		var url = host+"/app/user/info"
		ajax.query({
			url:url
		},function(res){
			console.log(res)
			callback(res);
		})
	},
	pay:function(caller){
		var selectCharge = caller.data.selectCharge;
		var totalFee = selectCharge.totalFee;
		var id = selectCharge.id;
		utils.showLoading()
		ajax.query({
			url:host+'/app/pay/recharg/card/wechatPrePay',
					  
			param:{cardId:id}
		},function(res){
			utils.hideLoading()
			if(res.code==="0000"){//允许发起支付
				var resData = res.data;

				wx.requestPayment( {
					timeStamp : resData.timeStamp,
					nonceStr : resData.nonceStr,
					package : 'prepay_id='+resData.prepayId,
					signType : 'MD5',
					paySign : resData.sign,			
					success : function() {
						wx.showToast({
							title:'充值成功'
						});
					},
					fail : function( ) {
						wx.showModal({
							title:'提示',
							content:'抱歉，充值失败',
							showCancel:false
						});
					}
				} );
				// service.trade.wxPay( {
				// 	timeStamp : resData.timeStamp,
				// 	nonceStr : resData.nonce_str,
				// 	package : 'prepay_id=' + resData.prepay_id,
				// 	signType : 'MD5',
				// 	paySign : resData.sign					
				// }, function( wxRes ) {
				// 	console.log('支付完成'+wxRes);
				// 	if ( !wxRes || wxRes.code != '0000' ) {
				// 		wx.showModal({
				// 			title:'提示',
				// 			content:'抱歉，充值失败',
				// 			showCancel:false
				// 		});
				// 	}else{
				// 		wx.showToast({
				// 			title:'充值成功'
				// 		});
				// 		_fn.renderUserDetail(caller,{balanceAnimate:'animate'});
				// 	}
				// } );
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
						totalFee:v.realMoney,
						price:v.rechargMoney
					});
				});
				var lastSelectCharge = callerPage.data.selectCharge||null;
				var selectCharge = chargeList[0];
				if(lastSelectCharge&&lastSelectCharge.id){
					var filterList = chargeList.filter(function(v,k){
						return v.id === lastSelectCharge.id
					});
					if(filterList.length === 1){
						selectCharge = lastSelectCharge
					}
				}
				callerPage.setData({
					chargeList:chargeList,
					selectCharge:selectCharge
				});

			}else{
				wx.showModal({
					title:'提示',
					content:res.msg
				});
			}
		});
	},
	renderUserDetail:function(callerPage,param){
		param = param || {};
		_fn.getUserDetail(res=>{
			var balance = 0;
			if(res.code === '0000'){
				var balance = res.data.userMoney || 0;
			}
			callerPage.setData({
				user:{
					balance:(balance/100).toFixed(2)
				},
				balance:(balance/100).toFixed(2)
			});
			_fn.renderBalance(callerPage,param.balanceAnimate);	

		});
	},
	renderBalance:function(callerPage,balanceAnimate){
		balanceAnimate = balanceAnimate || 'show'
		if(!callerPage){
			return;
		}
		var balanceStr = callerPage.data.balance.toString()||'';
		var balanceNum = balanceStr.split('');
		callerPage.setData({
			balanceNum:balanceNum,
			balanceAnimate:balanceAnimate
		});
	}
};