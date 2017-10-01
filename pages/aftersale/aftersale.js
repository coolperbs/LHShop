var _fn,
    service =  require( '../../service/service' ),
    utils = require('../../common/utils/utils'),
    aftersale = service.aftersale;
Page({
	onLoad:function(options){
		var self = this;
		var orderId = options.orderId;
		var skuId = options.skuId;

		self.setData({
			orderId:orderId,
			skuId:skuId,
		});
        _fn.getReason(self);
        _fn.getWareDetail(self)
	},
    changeReason:function(event){
        // console.log(event);
        var self = this;
        var val = event.detail.value;
        var selReasonObj = self.data.reasonObjList[val];
        var submitObj = self.data.submitObj || {};
        submitObj.returnReason = selReasonObj;
        self.setData({
            submitObj:submitObj
        });
    },
    changeNum:function(event){
        var self = this;
        var val = event.detail.value;
        var selNum = self.data.numItems[val];
        var submitObj = self.data.submitObj || {};
        submitObj.returnNum = selNum
        self.setData({
            submitObj:submitObj
        });

    },
    changeNotice:function(event){
        var self = this;
        var val = event.detail.value;
        var submitObj =  self.data.submitObj || {};
        submitObj.explain = val;
        self.setData({
            submitObj:submitObj
        });
    },
	uploadImg:function(event){
		var self = this
        var uploadMax = 3;
        var orderId = self.data.orderId;
        wx.chooseImage({
            count: uploadMax, // 默认9
            sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album','camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                console.log(res);
                var images = res.tempFilePaths;
                images.forEach(function(item, index) {
                    self.setData({
                        isComplete: false
                    });
                    utils.showLoading();
                    aftersale.upload({
                        orderId:orderId,
                        filePath:item
                    },function(res){
                        utils.hideLoading();
                        var imageList = self.data.imageList || [];
                        imageList.push(res.data.imgUri);
                        self.setData({
                            imageList:imageList
                        });
                    });
                });
            }
        });
	},
    delImg:function(event){
        var self = this;
        wx.showModal({
            title:'提示',
            content:'确定要删除这张照片么?',
            success:function(res){
                console.log(res);
                if(res.confirm){
                    var idx = event.currentTarget.dataset.index;
                    var imageList = self.data.imageList;
                    imageList.splice(idx,1);
                    self.setData({
                        imageList:imageList
                    });
                }
            }
        })
    },
    submit:function(event){
        var self = this;
        var orderId = self.data.orderId;
        var skuId = self.data.skuId;
        var imgUrlList = self.data.imageList;
        var submitObj = self.data.submitObj;
        var submitParam = {
            orderId:orderId,
            imgUrlList:imgUrlList,
            explain:submitObj.explain,
            returnGoodsVOList:[{
                skuId:skuId,
                returnNum:submitObj.returnNum,
                reasonList:submitObj.returnReason
            }]
        }
        aftersale.submit(submitParam,function(res){
            if(res.code==='0000' && res.success === true){
                wx.showModal({
                    title:'提示',
                    content:'提交成功',
                    showCancel:false,
                    success:function(){
                        wx.navigateBack();
                    }
                });
            }else{
                wx.showModal({
                    title:'错误',
                    content:'提交失败',
                    showCancel:false
                });
            }
        });
    }
});
_fn = {
    getWareDetail:function(caller){
        var skuId = caller.data.skuId;
        var orderId = caller.data.orderId;
        aftersale.getSkuAfersale({
            skuId:skuId,
            orderId:orderId
        },function(res){
            if(res.code==='0000'&&res.success===true){
                res.data.showPrice = utils.fixPrice(res.data.refundPrice);
                caller.setData({
                    ware:res.data
                });
                _fn.getNum(caller);
            }
        });
    },
    getReason:function(caller){
        aftersale.getReasons({},function(res){
            if(res.code==='0000'){
                var reasonItems = [];
                res.data.forEach((v,k)=>{
                    reasonItems.push(v.reasonDesc);
                });
                caller.setData({
                    reasonObjList:res.data,
                    reasonItems:reasonItems
                });
            }else{
                console.error("getReason Error :",res.code,res.msg);
            }
        });
    },
    getNum:function(caller){
        var maxNum = caller.data.ware.remainNum;
        var numItems = [];
        var submitObj = caller.data.submitObj||{};
        submitObj.returnNum = submitObj.returnNum || 1
        for(var i = 1 ; i <= maxNum ; i++){
            numItems.push(i.toString());
        }
        caller.setData({
            numItems:numItems,
            submitObj:submitObj
        });
    }

}