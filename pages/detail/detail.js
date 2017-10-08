Page({
	data : {
		pop : {
			show : false
		}
	},
	showPop : function() {
		this.setData( {
			'pop.show' : true
		} );
	},
	hidePop : function() {
		this.setData( {
			'pop.show' : false
		} );
	}
});