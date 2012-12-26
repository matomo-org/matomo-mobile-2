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
			getEvolutionImageGraphUrl: function () {
				if (!this.get('metadata') || !this.get('metadata').imageGraphEvolutionUrl) {
			        return '';
			    }

			    return this.get('metadata').imageGraphEvolutionUrl;
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
			},
			getRows: function () {
				var reportData = this.get('reportData');
				var metaData   = this.get('reportMetadata');
				var columns    = this.get('columns');

				var rows = [];

				if (_.isArray(reportData)) {
					for (var index in reportData) {
						rows.push({data: reportData[index], 
								   metadata: metaData ? metaData[index] : null,
								   sortOrderColumn: this.getSortOrder()});
					}
				} else {
        			// since Piwik Server 1.5.0: for reports with no dimensions, like VisitsSummary.get
					for (var index in reportData) {
						var row = {data: {label: columns[index]}, 
								   metadata: metaData ? metaData[index] : null,
								   sortOrderColumn: index};
						row.data[index] = reportData[index];
						rows.push(row);
					}
				}

				return rows;
			}

			// extended functions go here

		}); // end extend
		
		return Model;
	},
	
	
	extendCollection: function(Collection) {		
		_.extend(Collection.prototype, {
			parse: function (response) {

				var reportData = response.reportData;
				var metaData   = response.reportMetadata;

				for (var index in reportData) {
					reportData[index].id       = index;
					reportData[index].columns  = response.columns;
					reportData[index].metadata = response.metadata;
					reportData[index].reportMetadata = metaData ? metaData[index] : null;
				}


				return reportData;
			}

			// extended functions go here			
			
		}); // end extend
		
		return Collection;
	}
		
}

