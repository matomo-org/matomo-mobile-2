exports.definition = {
	
	config: {
		"columns": {
			"website":"string",
            "prettyDate":"string",
            "metadata":"string",
            "columns":"string",
            "reportData":"string",
            "reportMetadata":"string"
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

