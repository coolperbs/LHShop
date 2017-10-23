
var FileUploader = require('./fileUploader');
var Address = require('./address');
var Tab = require('./tab');
var List = require('./list');




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

module.exports = {
	List:List,
	tab:Tab,
	DropMenu:DropMenu,
	FileUploader:FileUploader,
	Address:Address
}