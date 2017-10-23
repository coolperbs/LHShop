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

module.exports = Address;