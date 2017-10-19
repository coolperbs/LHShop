var data = require( './data.js' ),
	modules = require( '../../widgets/modules/modules.js' ),
	utils = require( '../../common/utils/utils' ),
	service = require( '../../service/service' ),
	handle,
	events,
	_fn;

handle = {
	render : function( callerPage ) {
		_fn.init( callerPage );

		service.active.getHome( function( res ) {
			if ( utils.isErrorRes( res ) ) {
				return;
			}

			callerPage.setData( {
				'viewData.pageData' : res.data,
				'viewData.showShops' : false
			} );
			console.log( res );
		} );
	}
}

events = {
	toggleShops : function() {
		var self = this;
		self.setData( {
			'viewData.showShops' : !self.data.viewData.showShops
		} );
	},
	showShops : function( e ) {
		this.setData( {
			'viewData.showShops' : true
		} );
	},
	hideShops : function() {
		this.setData( {
			'viewData.showShops' : false
		} );
	}
}

_fn = {
	init : function( callerPage ) {
		if ( callerPage.initedHome ) {
			return;
		}
		utils.mix( callerPage, {
	      homeClickProxy : function( e ) {
	        var target = e.currentTarget;
	        if ( target.dataset && target.dataset.fn && events[target.dataset.fn] ) {
	          events[target.dataset.fn].call( this, e );
	        }
	      },
	      moduleClickProxy : function( e ) {
	        var target = e.currentTarget;
	        if ( target.dataset && target.dataset.fn && modules.events[target.dataset.fn] ) {
	          modules.events[target.dataset.fn].call( this, e );
	        }
	      }
	    } );
	    callerPage.initedHome = true;
	}
}

module.exports = handle;