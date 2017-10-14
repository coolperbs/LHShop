var ajax = require('../../common/ajax/ajax');

class List{
	constructor(props) {
		props = props || {};
		this.setConfig(props);
	}
	
	next(){//下一页
		if(this.isLast || this.isLock){
			return;
		}
		this.isLock = true;
		if(!this.isSingle){
			this.curPage = this.curPage + 1;
		}
		var self =this;
		this.getData(function(res){
			self.isLock = false;
			if(res.data && res.code === '0000'){
				self.curData = res.data.list;
				if(!self.isSingle){
					self.isLast = !res.data.hasMore;
					self.totalData = self.totalData.concat(self.curData);
				}else{
					self.totalData = self.curData;
				}
				if(self.render && typeof self.render==='function'){
					self.render({
						totalData:self.totalData,
						eventParam:JSON.stringify({
							page:self.curPage
						})
					});
				}

			}

		});
	}
	update(e){//更新一条数据
		if(this.isSingle){
			this.next();
		}
	}
	getData(callback){
		var param = this.param;
		if(!this.isSingle){
			param.currentPage = this.curPage;
		}
		var self = this;
		ajax.query({//换ajax。query
			url:this.url,
			param:param
		},function(res){

			var resData = {
				code : res.code,
				data:{
					list:self.getList(res),
					hasMore:self.getHasMore(res)
				}
			}

			if(callback && typeof callback === 'function'){
				callback(resData);
			}

		});
	}
	setConfig(props){
		this.url = props.url;//请求地址
		this.param = props.param;//请求参数
		this.render = props.render;//渲染函数
		this.isSingle = props.isSingle || false//是否分页，默认为true，
		this.getList = props.getList;
		this.getHasMore = props.getHasMore;

		this.curData = [];//当前新增数据
		this.totalData = [];//全部数据
		this.curPage = 0;//当前页码
		this.isLast = false;
		this.isLock = false;  
	}
}
class Tab{
	constructor(props) {
		this.tabs = props.tabs;
		this.offset = props.offset||0;
		this.num = props.tabs.length;
		this.tabData = [];
		this.hlLeftData = [];
		this.tabs.forEach((v,k)=>{
			this.tabData.push({
				name:v.name,
				style:'width:'+750/this.num+'rpx',
				param:JSON.stringify({
					index:k
				})
			});
			this.hlLeftData.push(((750/this.num)*k+this.offset)+'rpx');
		});
	}
	change(e){
		var ret = this.renderData || {};
		var index = 0;
		if(e){
			index = JSON.parse(e.currentTarget.dataset.param).index;
		}
		this.tabData = this.tabData.map((v,k)=>{
			if(k===index){
				v.isCur = true
			}else{
				v.isCur = false
			}
			return v;
		});
		ret = {
			tabData:this.tabData,
			hlLeft:this.hlLeftData[index],
			curData:this.tabs[index].data
		}
		return ret;
	}
}
class Uploader{
	constructor(props) {
		this.max = props.max || 3;
		this.curData = [];

		
		
	}
	change(){

	}
	uploadImg(event){
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
	}
    delImg(event){
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
    }
}
class DropMenu{
	constructor(props) {
		this.data = props.data;
		this.isMulti = props.isMulti||true;
		this.header = [];
		this.menus = {};
		this.curMenu;
		this.showMenu;
		this.selectedItem = {};
		this.reset();
	}
	reset(){
		var self = this;
		this.data.forEach((v,k)=>{
			var headerId = 'header-'+k;
			self.header.push({
				text:v.header.text,
				// dataId:v.id,
				param:{isActive:false,id:headerId}
			});
			var menuData = [];
			v.menu.forEach((vm,km)=>{
				var itemId = headerId+'menu-'+km;
				menuData.push({
					text:vm.text,
					// dataId:vm.id,
					param:{
						id:itemId,
						headerId:headerId,
						isActive:false
					}
				});

			});
			self.menus[headerId] = menuData
		});
	}
	changeHeader(e){
		if(!e){
			return {
				header:this.header,
				showMenu:false,
				menu:null
			}
		}
		var param = e.currentTarget.datset.param;
		var id = param.id;
		if(!param.isActive){//展开
			this.header = this.header.map((v,k)=>{
				if(v.param.id === id){
					v.isActive = true;
				}else{
					v.isActive = false;
				}
				return v;
			});
			this.curMenu = this.menus[id];
			this.showMenu = true;
		}else{//关闭
			this.header = this.header.map((v,k)=>{
				v.isActive = false
				return v;
			});
			this.curMenu = null;
			this.showMenu = false;
		}
		return {
			header:this.header,
			showMenu:this.showMenu,
			menu:this.menu
		}


	}
	changeItem(e){
		if(!e){
			return;
		}
		var param = e.currentTarget.dataset.param;
		var id = param.id;
		var headerId = param.headerId;
		if(!param.isActive){//选中
			this.menus[headerId] = this.menus[headerId].map((v,k)=>{
				if(v.id === id){
					v.param.isActive = true;
					this.selectedItem[v.param.id] = v;
				}else{
					v.param.isActive = false;
					this.selectedItem[v.param.id] = null;//使用delete删除

				}
				return v;
			});
		}else{//取消选中

		}

	}
	getSelected(){

	}

};
class Address{
	constructor(props) {
		this.changeCallback = props.changeCallback;
		this.curProvinceId = props.provinceId||'110000';
		this.curCityId = props.cityId;
		this.curCountryId = props.countryId;


		this.provinceList = [];
		this.cityList = [];
		this.countryList = [];
	}
	change(e){
		var self = this;
		if(e){
			var param = JSON.parse(e.currentTarget.dataset.param);
			var index = e.detail.value;
			if(param.type === 'province'){
				this.curProvince = this.provinceList[index]
				this.curProvinceId = this.curProvince.adcode;

				this.cityList = [];
				this.curCity = null;
				this.curCityId = null;

				this.countryList = [];
				this.curCountry = null;
				this.curCountryId = null;

			}else if(param.type === 'city'){
				if(!index || this.cityList.length<=0){
					return;
				}
				this.curCity = this.cityList[index]
				this.curCityId = this.curCity.adcode;

				this.countryList = [];
				this.curCountry = null;
				this.curCountryId = null;

			}else if(param.type === 'country'){
				if(!index || this.countryList.length<=0){
					return;
				}
				this.curCountry = this.countryList[index]
				this.curCountryId = this.curCountry.adcode;
				this.finish();

			}
		}
		if(self.provinceList.length === 0){
			this.getProvince(function(provinceInfo){
				self.getCity(self.curProvinceId,function(cityInfo){
					self.getCountry(self.curCityId,function(countryInfo){
						self.finish();
					});
				});
			});
		}else if(self.cityList.length === 0){
			self.getCity(self.curProvinceId,function(cityInfo){
				self.getCountry(self.curCityId,function(countryInfo){
					self.finish();
				});
			});
		}else if(this.countryList.length === 0){
			self.getCountry(self.curCityId,function(countryInfo){
				self.finish();
			});
		}
	}
	finish(){
		if(this.changeCallback && typeof this.changeCallback === 'function'){
			var retData = {
				province:this.curProvince,
				city:this.curCity,
				country:this.curCountry,

				provinceList:this.provinceList,
				cityList:this.cityList,
				countryList:this.countryList,

				provinceParam:JSON.stringify({type:'province'}),
				cityParam:JSON.stringify({type:'city'}),
				countryParam:JSON.stringify({type:'country'})
			}
			this.changeCallback(retData);
		}
	}
	getProvince(callback){
		var getProvinceUrl = "http://shopgateway.yimeixinxijishu.com/common/address/province";
		var self = this;
		wx.request({
			url:getProvinceUrl,
			success:function(res){
				if(callback && typeof callback==='function'){
					if(res.data.data && res.data.data.length>0){
						self.curProvinceId = self.curProvinceId || res.data.data[0].adcode
						self.curProvince = res.data.data.filter((v,k)=>{
							return v.adcode/1 === self.curProvinceId/1
						})[0];
						self.provinceList= res.data.data;
					}
					callback(res.data)
				}
			}
		});
	}
	getCity(provinceId,callback){
		if(!provinceId){
			callback();
		}
		var self = this;
		var getCityUrl = "http://shopgateway.yimeixinxijishu.com/common/address/city/"+provinceId;
		wx.request({
			url:getCityUrl,
			success:function(res){
				if(callback && typeof callback==='function'){
					if(res.data.data && res.data.data.length>0){
						self.curCityId = self.curCityId || res.data.data[0].adcode;
						self.curCity = res.data.data.filter((v,k)=>{
							return v.adcode/1 === self.curCityId/1
						})[0];
						self.cityList= res.data.data;
					}
					callback(res)
				}
			}
		})
	}
	getCountry(cityid,callback){
		if(!cityid){
			callback();
		}
		var self = this;
		var getCountryUrl = "http://shopgateway.yimeixinxijishu.com/common/address/country/"+cityid;
		wx.request({
			url:getCountryUrl,
			success:function(res){
				if(callback && typeof callback==='function'){
					if(res.data.data && res.data.data.length>0){
						self.curCountryId = self.curCountryId || res.data.data[0].adcode;
						self.curCountry = res.data.data.filter((v,k)=>{
							return v.adcode/1 === self.curCountryId/1
						})[0];
						self.countryList = res.data.data;
					}
					callback(res)
				}
			}
		})

	}

}
module.exports = {
	List:List,
	tab:Tab,
	DropMenu:DropMenu,
	uploader:Uploader,
	Address:Address
}