var query = require("../../common/query/query"),
	service = require("../../common/service/service"),
	handle;

handle = {
	getIndex:function(param,callback){//获取首页
		query.getByName("appGateWayIndex",param,function(res){
			if(typeof callback==="function"){
				callback(res);
			}
		});
	},
	getStore:function(param,callback){//获取商家
		var url = query.getCgis().appGateWayGetStoreById;
		if(param.storeId){
			url = url + "/" +param.storeId;
		}
		query.get(url,{},function(res){
			if(typeof callback==="function"){
				callback(res);
			}

		});
	},
};

module.exports = service( handle );