exports.definition = {
	
	config: {
		"columns": {
			"value":"string"
		},
		"adapter": {
			"type": "piwikapi",
			"collection_name": "piwiktokenauth"
		},
		"settings": {
		    "method": "UsersManager.getTokenAuth",
		    "cache": true
		},
		"defaultParams": {}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {

			// extended functions go here

		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			
			// extended functions go here			
			
		}); // end extend
		
		return Collection;
	}
		
}

