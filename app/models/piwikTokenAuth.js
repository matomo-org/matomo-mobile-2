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
		    "cache": false
		},
		"defaultParams": {}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {
            
            validResponse: function (response) {
                var _ = require("alloy/underscore");
                 
                if (!response || !_.isObject(response) || !response.value) {
        
                    return false;
                }
                
                return true;
            }

		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			
		}); // end extend
		
		return Collection;
	}
		
}

