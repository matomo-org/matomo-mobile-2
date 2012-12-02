exports.definition = {
	
	config: {
		"columns": {
			"category":"string",
            "name":"string",
            "module":"string",
            "action":"string",
            "dimension":"string",
            "metrics":"string",
            "metricsDocumentation":"string",
			"uniqueId":"string"
		},
		"adapter": {
			"type": "piwikapi",
			"collection_name": "piwikprocessedreport"
		},
		"settings": {
		    "method": "API.getProcessedReport",
		    "cache": true
		},
		"defaultParams": {
		    hideMetricsDoc: 1, 
		    showTimer: 0, 
		}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {
		    getEntryReport: function (response) {
		        // Has All Websites Dashboard report etc?
		        return response[0];
		    }
		    
	
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

