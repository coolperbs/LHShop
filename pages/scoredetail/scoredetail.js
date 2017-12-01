var weigetUtils = require('../../common/utils/weigetUtil');
var List = weigetUtils.List;
var utils = require('../../common/utils/utils');
var config = require('../../config');
var host = config.host;
var ajax = require('../../common/ajax/ajax');
Page({
	onShow:function(){
		console.log('scoredetail');
		var self = this;
		_fn.renderHeader(self);
		_fn.renderList(self);
	},
	loadMore:function(){
		var self = this;
		self.listWeiget.next();
	},
	redirect:function(e){
		var pagename =e.currentTarget.dataset.pagename
		wx.navigateTo({
			url:'../../pages/pointToMoney/pointToMoney'
		});
	}
})
var _fn = {
	renderHeader:function(page){
		var url = host+"/app/user/info"
		ajax.query({
			url:url
		},function(res){
			var userinfo = res.data;
			userinfo.userMoney = userinfo.userMoney || 0
			userinfo.userPoint = userinfo.userPoint || 0
			userinfo.showUserLevel = userinfo.levelInfo || 1
			userinfo.showUserMoney = {
				int:userinfo.userMoney.toFixed(2).split('.')[0],
				float:userinfo.userMoney.toFixed(2).split('.')[1],
			}
			page.setData({
				userinfo:userinfo
			});
		})
	},
	renderList:function(page){
		wx.getSystemInfo({
			success:function(res){
				var scrollHeight = (res.windowHeight)+'px';
				page.setData({
					scrollHeight:scrollHeight
				});
			}
		});
		page.listWeiget = page.listWeiget || new List({
			url:host+'/app/user/point',
			render:function(data){
				page.setData({
					listData:data.totalData
				});
			},
			getList:function(res){
				var retList = [];
				if(res.code === '0000' && res.data){
					retList = res.data.points.map((v,k)=>{
						var renderObj = {}
						renderObj.type = v.type===1?'add':'delete';
						renderObj.title = v.type===1?'获得积分':'消费积分';
						renderObj.price = v.type===1?'+'+(v.price):'-'+(v.price);
						renderObj.orderId = '消费单号:'+v.orderId;
						renderObj.time = utils.formateTime(v.created,true)
						return renderObj;

					});
				}
				return retList;

			},
			getHasMore:function(res){
				// return false
				return true;
			}
		});
		page.listWeiget.next();
	}
}