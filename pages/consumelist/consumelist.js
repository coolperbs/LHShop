var _fn,
currentPage,
dataLoad,
isLastPage,//是否停止加载
utils = require( '../../common/utils/utils' ),
service = require( '../../service/service' ),
chargeService = service.charge,
userService = service.user;


Page({
	onShow:function(){
		if(dataLoad){
			return;
		}
		var self = this;
		currentPage = 1;
		isLastPage = false;
		_fn.reqRecordData(res => {
			var newRecordList = res.data.result || [];
			self.addRecords(newRecordList);
			if(res.data.lastPage){
				isLastPage = true;
			}
		});
	},
	onReachBottom:function(){
		if(dataLoad || isLastPage){
			return;
		}
		var self = this;
		currentPage = currentPage+1;
		_fn.reqRecordData(res=>{
			var newRecordList = res.data.result || [];
			self.addRecords(newRecordList);
			if(res.data.lastPage){
				isLastPage = true;
				self.setData({
					isLast:isLastPage
				})
			}
		});
	},
	addRecords:function(newRecordList){
		var self = this;
		var recordList = self.data.recordList||[];
		if(newRecordList && newRecordList.length>0){
			newRecordList = newRecordList.map((v,k)=>{
				v.showVal = (Math.abs(v.val/100)).toFixed(2);
				if(v.val>0){
					v.showVal = "+"+v.showVal;
				}else{
					v.showVal = "-"+v.showVal;
				}
				return v
			});
		}
		newRecordList = recordList.concat(newRecordList);
		self.setData({
			recordList:newRecordList
		});

	}

});
_fn = {
	reqRecordData:function(callback){
		dataLoad = true;
		utils.showLoading()
		chargeService.getConsumeRecord({
			currentPage:currentPage
		},res=>{
			if(res.code === '0000'){
				if(typeof callback === 'function'){
					callback(res);
				}
			}
			dataLoad = false;
			utils.hideLoading();
		});
	}
}