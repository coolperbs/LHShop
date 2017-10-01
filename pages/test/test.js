// var utils = require( "../../common/utils/utils" );
// var cartService = require('../../service/cart/cart');
var homeService = require('../../service/home/home');
// var payService = require("../../service/pay/pay");
// var us = require("../../lib/underscore");
var _fn;

Page({
	onLoad:function(){
		_fn.testHome();
	}
});
_fn = {
	testCart:function(){

	},
	testHome:function(){
		// homeService.getAbc({},function(res){
		// 	console.log(res);
		// });
		// homeService.getStore({storeId:1},function(res){
		// 	console.log(res);
		// });

	}
};