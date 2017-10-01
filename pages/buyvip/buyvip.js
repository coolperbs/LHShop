var _fn,
utils = require( '../../common/utils/utils' ),
service = require( '../../service/service' ),
chargeService = service.charge,
userService = service.user;

Page({
	onShow:function(){
		_fn.getRuleList(ruleList =>{
			this.setData({
				ruleList:ruleList,
				selectRule:ruleList[0]
			});
		});
		// _fn.getUserDetail(user=>{//如果用户已经是vip，则不可以购买vip
		// 	if(user.type!==1){
		// 		wx.showModal({
		// 			title:'提示',
		// 			content:'您已经购买了vip',
		// 			showCancel:false,
		// 			success:function(res){
		// 				wx.navigateBack()
		// 			}
		// 		});
		// 	}
		// });
	},
	choseRule:function(event){
		var self = this;
		var id = event.currentTarget.dataset.id;
		var selRul = self.data.ruleList.filter((v,k)=>{
			return v.id === id;
		});
		self.setData({
			selectRule :selRul[0]
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
	}
});

_fn = {
	pay:function(caller){
		var selectRule = caller.data.selectRule;
		var totalFee = selectRule.totalFee;
		var id = selectRule.id;
		utils.showLoading()
		chargeService.payPlus({
				ruleId:id,
				totalFee:totalFee
		},res => {
			utils.hideLoading();
			var resData = res.data || {};
			if(res.code==="0000"){//允许发起支付
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
							content:'抱歉，购买会员失败',
							showCancel:false
						});
					}else{
						wx.showModal({
							title:'提示',
							content:'恭喜，购买会员成功',
							showCancel:false,
							success:function(res){
								if(res.confirm){
									wx.setStorageSync('plusanim',true);
									wx.navigateBack();
								}
							}
						});
					}
					// 跳转到订单
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
	getRuleList:function(callback){
		chargeService.getPlusList({},function(res){
			if(res.code === '0000'){
				var ruleList = [];
				res.data.forEach(function(v,k){
					ruleList.push({
						id:v.id,
						price:v.price/100,
						timeUnit:_fn.getDurition(v),
						limit:v.limitDateStr,
						totalFee:v.price
					});
				});
				if(typeof callback === 'function'){
					callback(ruleList);
				}
			}
		});
	},
	getDurition:function(rule){//获取服务时长
		var durition;
		var months = rule.months.toString();
		if(months === '1'){
			durition = '月';
		}else if(months === '12'){
			durition = '年';
		}else{
			durition = months+'月';
		}
		return durition;
	},
	getUserDetail:function(callback){
		utils.showLoading();
		userService.getUserDetail(res=>{
			utils.hideLoading()
			if(res.code === '0000' && res.success===true){
				if(typeof callback === 'function'){
					callback(res.data);
				}
			}else{
				console.error(res.msg);

			}
		});
	}
};
