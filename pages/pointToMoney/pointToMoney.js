var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var host = config.host;

Page({
	onShow:function(){
		var self =this;
		_fn.renderHeader(self);
	},
	changeinput:function(e){
		var key = e.currentTarget.dataset.key;
		var val = e.detail.value;
		var self = this;
		self.formData = self.formData || {};
		self.formData[key] = val;
	},
	toMoney:function(){
		var self = this;
		var formData = self.formData || {};
		if(!formData.point || formData.point>formData.maxPoint || !/^[0-9]*$/.test(formData.point)){
			wx.showModal({
				title:'提示',
				content:'请输入正确的积分数量',
				showCancel:true,
				success:function(){

				}
			})
			return;
		}
		var url = host + '/app/recharg/point';
		var point = self.formData.point;
		var param = {point:point}
		ajax.query({
			url:url,
			param:param
		},function(res){
				if(res.code === '0000'){
					wx.showModal({
						title:'提示',
						content:'兑换成功',
						showCancel:false
					});
					self.setData({userInfo:res.data});
				}else{
					wx.showModal({
						title:'提示',
						content:'抱歉，请稍后再试('+res.code+')',
						showCancel:false
					});
				}
			}
		)

	}
})

var _fn = {
	renderHeader:function(page){
		var url = host+"/app/user/info"
		ajax.query({
			url:url
		},function(res){
			var userinfo = res.data;
			page.setData({
				userInfo:userinfo
			});
		})
	},
}