var handle,
	error = require( '../error' ),
	ajax = require( '../../common/ajax/ajax' ),
	service = require('../../common/service/service'),
	utils = require( '../../common/utils/utils' ),
	config = require('../../config'),
	env = config.env,
	hostTrading = config.host.trading[env];


handle = {
	getUncommentOrder:{//获取未评论订单列表
		url:hostTrading+'/mch/order/commentList'
	},
	clearUncommentOrder:{//晴空未评论列表
		url:hostTrading+'/order/closeComment' // 传入orderId
	},
	commentOrderWares:{//评论订单商品
		url:hostTrading+'/mch/comment/ware/batchadd'
	},
	commentOrderStore:{//评论订单门店
		url:hostTrading+'/mch/comment/shop/add'
	},
	getCommentList:{
		url:hostTrading+'/mch/comment/ware/query'
	},
	getCommentStatistics:{
		url:hostTrading+'/mch/comment/ware/statistics'
	},
	getStars:function(){
		return [
			{
				val:1,
			},
			{
				val:2
			},
			{
				val:3
			},
			{
				val:4
			},
			{
				val:5
			},
		];
	},
	getGoodTicks:function(){
		return [
			{
				id:1,
				text:'商品新鲜'
			},
			{
				id:2,
				text:'包装精美'
			},
			{
				id:3,
				text:'干净好吃'
			},
			{
				id:4,
				text:'很赞'
			},
			{
				id:5,
				text:'服务很好'
			}

		];
	},
	getBadTicks:function(){
		return [
			{
				id:1,
				text:'质量不新鲜'
			},
			{
				id:2,
				text:'口味不佳'
			},
			{
				id:3,
				text:'包装破损'
			},
			{
				id:4,
				text:'临近保质期'
			}

		]
	}
}

module.exports = service(handle);