var sortOrder = null;

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
			setSortOrder: function (sort) {
				// TODO set config.defaultParams.filter_sort_column|sortOrderColumn
				sortOrder = sort;
			},
			getSortOrder: function () {
				return sortOrder;
			},
			getImageGraphUrl: function () {
				if (!this.get('metadata') || !this.get('metadata').imageGraphUrl) {
			        return '';
			    }

			    return this.get('metadata').imageGraphUrl;
			},
			getMetrics: function () {
				return this.get('columns');
			},
			getMetricName: function () {
				var metrics = this.getMetrics();
				var sortOrder = this.getSortOrder();

				if (metrics && metrics[sortOrder]) {
					return metrics[sortOrder];
				}

				return ''
			},
			getReportName: function () {
				if (this.get('metadata') && this.get('metadata').name) {
					return this.get('metadata').name;
				}
				return '';
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

