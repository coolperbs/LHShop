var _fn,
utils = require( '../../common/utils/utils' ),
service = require( '../../service/service' ),
commentService = service.comment,
userService = service.user;
Page({
	data:{
		commentGoodTicks:commentService.getGoodTicks(),
		commentBadTicks:commentService.getBadTicks(),
		stars:commentService.getStars()
	},
	onLoad:function(option){
		var skuId = option.skuid;
		var self = this;
		self.setData({
			skuId:skuId,
			page:1,
			curTab:'all',
			isLast:false,
			commentList:[]
		});
		_fn.getCommentData(self);
		_fn.getCommentStatistics(self);
		wx.getSystemInfo({
			success:function(res){
				self.setData({
					height:res.windowHeight - 50
				});
			}
		});
	},
	selectTab:function(event){
		var self = this;
		var tabKey = event.currentTarget.dataset.key;
		self.setData({
			page:1,
			curTab:tabKey,
			isLast:false,
			commentList:[]
		});
		_fn.getCommentData(self);
	},
	loadMore:function(){
		var self = this;
		var isLast = self.data.isLast;
		if(isLast){
			return
		}
		var page = self.data.page + 1;
		self.setData({
			page:page
		});
		_fn.getCommentData(self);
	}
});
var _fn = {
	getCommentStatistics:function(caller){
		var skuId = caller.data.skuId
		commentService.getCommentStatistics({
			skuId:skuId
		},res=>{
			var resData = res.data || {};
			caller.setData({
				statistics:resData.scoreShowList
			});
		});
	},
	getCommentData:function(caller){
		var page = caller.data.page||1;
		var skuId = caller.data.skuId
		utils.showLoading();
		var level = caller.data.curTab==='all'?'':caller.data.curTab;
		commentService.getCommentList({
			currentPage:page,
			skuId:skuId,
			pageSize:20,
			level:level
		},res=>{
			utils.hideLoading();
			if(res.code==='0000' && res.success){
				var resData = res.data||{};
				var commentList = res.data.result||[]
				_fn.renderCommentList(caller,commentList);
				caller.setData({
					isLast:resData.lastPage
				});
			}else{
				console.error("getCommentList error",res.msg)
			}
		});
	},
	renderCommentList:function(caller,data){
		var commentList = data||[];
		var contentLength = 10;
		commentList = commentList.map((v,k)=>{
			v.labelArray = JSON.parse(v.label||'[]');
			v.stars = commentService.getStars();
			v.content = v.content || '';
			v.contentLabel = v.content.length<contentLength?v.content:v.content.substring(0,contentLength)+'...';//用户输入只显示10个字
			return v
		});
		var oldCommentList = caller.data.commentList || [];
		var newCommentList = oldCommentList.concat(commentList);
		caller.setData({
			commentList:newCommentList
		});
	},

}
