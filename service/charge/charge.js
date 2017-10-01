var service = require('../../common/service/service'),
	config = require('../../config'),
	env = config.env,
	hostTrading = config.host.trading[env],
	handle;

handle = {
	payCharge:{//充值余额
		url:hostTrading+'/mch/pay/balance-recharge'
	},
	payPlus:{//购买会员
		url:hostTrading+'/mch/pay/plus-buy'
	},
	getChargeList:{//获取可充金额
		url:hostTrading+'/mch/balance/rules'
	},
	getPlusList:{//获取可以购买会员的时间长度
		url:hostTrading+'/mch/user/plus/rules'
	},
	getConsumeRecord:{
		url:hostTrading+'/mch/balance/record/list'
	}
};
module.exports = service(handle);