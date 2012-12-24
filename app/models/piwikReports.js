var Alloy = require('alloy');

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
			"collection_name": "piwikreports"
		},
		"settings": {
		    "method": "API.getReportMetadata",
		    "cache": true
		},
		"defaultParams": {
		    showSubtableReports: 0,
		    hideMetricsDoc: 1, 
		}
	},		

	extendModel: function(Model) {		
		_.extend(Model.prototype, {

			getSortOrder: function (metric) {

				if (metric) {
					return metric;
				}

				var _ = require("alloy/underscore");
			    var preferredRows = Alloy.CFG.piwik.preferredMetrics;
			    var sortOrder     = _.first(preferredRows);
			    
			    var metrics = this.get('metrics');
			    if (metrics) {

			        sortOrder = _.find(preferredRows, function (preferredRow) {
			            return !!(metrics[preferredRow]);
			        });

			        if (!sortOrder) {
				        for (var metricName in metrics) {
				            sortOrder = metricName;
				        }
			        }
			    }
			    
			    return sortOrder;
			},
			// extended functions go here

		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			getEntryReport: function (response) {

				var visitsSummaryReport = this.find(function (model) {
					return model.get('module') == 'VisitsSummary' && model.get('action') == 'get';
				});

				if (visitsSummaryReport) {
					return visitsSummaryReport;
				}

				// TODO search for other reports
		        return this.at(0);
		    },

		    containsAction: function (searchReport) {
		    	var searchAction = searchReport.get('action');
		    	var searchModule = searchReport.get('module');

		    	var reports = this.where({action: searchAction, module: searchModule});
		    	return !!reports.length;
		    }

			// extended functions go here			
			
		}); // end extend
		
		return Collection;
	}
		
}

