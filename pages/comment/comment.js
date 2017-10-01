var app = getApp();
var service = require( '../../service/service' );
var commentService = service.comment;
var orderSerivce = service.order;
var us = require('../../lib/underscore')
Page({
	data:{
		stars:commentService.getStars()
	},
	onLoad:function(option){
		var self = this;
		var orderId = option.orderId;
		orderSerivce.getOrderDetail({id:orderId},res=>{
			var wares = []
			res.data.units.forEach(function(v,k){
				if(v.wares && v.wares.length>0){
					v.wares.forEach(function(vw,kw){
						vw.commentTicks = commentService.getGoodTicks()
						vw.stars = commentService.getStars();
						vw.wareScore = 5;
					});
					wares = wares.concat(v.wares);
				}
			});
			self.setData({
				order:res.data,
				wares:wares,
				shopScore:5,
				shopScoreMark:'非常满意'
			});
		});
	},
	submit:function(){
		var self = this;
		var orderId = self.data.order.id;
		var shopId = self.data.order.shopId;
		var wares = self.data.wares;
		var shopScore = self.data.shopScore
		var shopName = self.data.order.shopName;
		var skuComments = [];
		wares.forEach((v,k)=>{
			var labels = self.getTickedLabel(v)||[];
			var content = v.content;
			if(labels.length === 0 && !content){
				switch(v.wareScore>0){
					case v.wareScore === 5:
					content = '非常满意'
					break;
					case v.wareScore === 4:
					content = '满意'
					break;
					case v.wareScore === 3 || v.wareScore === 2 || v.wareScore === 1:
					content = '不满意'
					break;
				}
			}
			skuComments.push({
				content:content,
				label:labels,
				score:v.wareScore,
				skuId:v.skuId,
				skuName:v.wareName

			});
		});
		var wareCommentInfo = {
			orderId:orderId,
			shopId:shopId,
			skus:skuComments
		}
		var shopCommentInfo = {
			orderId:orderId,
			score:shopScore,
			shopId:shopId,
			shopName:shopName
		};

		commentService.commentOrderWares(wareCommentInfo,res=>{
			if(res.code === '0000' && res.success){
				commentService.commentOrderStore(shopCommentInfo,res=>{
					if(res.code === '0000'&& res.success){
						wx.showModal({
							title:'提示',
							content:'评论成功',
							showCancel:false,
							success:function(){
								wx.navigateBack();
							}
						});
					}else{
						wx.showModal({
							title:'错误',
							content:'评论失败',
							showCancel:false
						});
					}
				});
			}else{
				wx.showModal({
					title:'错误',
					content:'评论失败',
					showCancel:false
				});
			}
		});

	},
	changeServiceStar:function(event){
		var value = event.currentTarget.dataset.value/1;
		var shopScoreMark = "";
		switch(value>0){
			case value === 5:
			shopScoreMark = '非常满意'
			break;
			case value === 4:
			shopScoreMark = '满意'
			break;
			case value === 3 || value === 2 || value === 1:
			shopScoreMark = '不满意'
			break;
		}
		this.setData({
			shopScore:value,
			shopScoreMark:shopScoreMark
		})

	},
	changeWareStar:function(event){
		var self = this;
		var value = event.currentTarget.dataset.value;

		var id = event.currentTarget.dataset.id;
		var wares = self.data.wares || [];
		var newWareList = wares.map((v,k)=>{
			if(v.id===id){
				var lastScore = v.wareScore;
				v.wareScore = value;
				//切换评价ticket
				if(lastScore!=0 && lastScore<3 && value>=3){//变成积极评价
					v.commentTicks = commentService.getGoodTicks();
					v.selectTicks = [];
				}else if(lastScore>=3 && value<3){//变成消极评价
					v.commentTicks = commentService.getBadTicks();
					v.selectTicks = [];

				}
			}
			return v;
		});
		this.setData({
			wares:newWareList
		})

	},
	changeWareContent:function(event){
		var self = this;
		var id = event.currentTarget.dataset.id;
		var content = event.detail.value;
		var wares = self.data.wares || [];
		var newWareList = wares.map((v,k)=>{
			if(v.id===id){
				v.content = content;
			}
			return v;

		});
		this.setData({
			wares:newWareList
		});

	},
	selectTicked:function(event){
		var self = this;
		var id = event.currentTarget.dataset.id;
		var value = event.currentTarget.dataset.value;
		var wares = self.data.wares || [];
		var newWareList = wares.map((v,k)=>{
			if(v.id===id){
				var selectTicks = v.selectTicks || [];
				var valueIndex = selectTicks.indexOf(value);
				if(valueIndex>=0){
					selectTicks.splice(valueIndex,1);
				}else{
					selectTicks.push(value);
				}
				v.selectTicks = selectTicks;
				var commentTicks = v.commentTicks||[];
				v.commentTicks = commentTicks.map((cv,ck)=>{
					if(selectTicks.indexOf(cv.id)>=0){
						cv.active = true;
					}else{
						cv.active = false;
					}
					return cv;
				});
			}
			return v;
		});
		this.setData({
			wares:newWareList
		});
	},
	getTickedLabel:function(ware){
		var commentTicks = ware.commentTicks;
		var selectTicketIds = ware.selectTicks || [];
		var ticketLabels=[];
		for(var i = 0 ; i < commentTicks.length ; i++){
			if(selectTicketIds.indexOf(commentTicks[i].id)>=0){
				ticketLabels.push(commentTicks[i].text);
			}
		}
		return ticketLabels;

	}
});