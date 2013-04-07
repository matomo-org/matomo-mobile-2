
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
            "cache": false
        },
        "defaultParams": {
            hideMetricsDoc: 1, 
            showTimer: 0,
            filter_limit: 40
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {
            sortOrder: null,
            setSortOrder: function (sort) {
                // TODO set config.defaultParams.filter_sort_column|sortOrderColumn
                this.sortOrder = sort;
            },
            getSortOrder: function () {
                return this.sortOrder;
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
            getReportDate: function () {
                if (this.get('prettyDate')) {
                    return this.get('prettyDate');
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
            sortOrderColumn: null,

            fetchProcessedReports: function (sortOrderColumn, options) {
                this.sortOrderColumn = sortOrderColumn;

                options.params.sortOrderColumn    = sortOrderColumn;
                options.params.filter_sort_column = sortOrderColumn;
                options.reset = true;

                this.fetch(options);
            },
            parse: function (response) {

                if (!response || !response.reportData) {
                    
                    return [];
                }
                    
                var reportRow = [];
                var label;
                var value;
                var row;
                var metadata;
                var report;
                
                var reportData     = response.reportData;
                var reportMetadata = response.reportMetadata;
                var hasSubtables   = response.metadata && response.metadata.actionToLoadSubTables;

                if (_.isArray(reportData) && 0 < reportData.length) {

                    for (var index = 0; index < reportData.length; index++) {
                        if (!reportData[index]) {
                            continue;
                        }
                        
                        report       = reportData[index];
                        metadata     = null;
                        if (reportMetadata && reportMetadata[index]) {
                            metadata = reportMetadata[index];
                        }

                        label  = report.label;
                        value  = report.value;
                        
                        if (report[this.sortOrderColumn]) {
                            value = report[this.sortOrderColumn];
                        }

                        if (metadata && metadata.shortLabel) {
                            // always prefer the sortLabel
                            label = metadata.shortLabel;
                        }

                        row = report;
                        row.title = label;
                        row.value = value;
                        
                        if (metadata && metadata.logo) {
                            
                            row.logo = metadata.logo;
                            
                            if (metadata.logoWidth) {
                                row.logoWidth  = metadata.logoWidth;
                            }
                            if (metadata.logoHeight) {
                                row.logoHeight = metadata.logoHeight;
                            }
                        }
                        
                        if (hasSubtables && metadata && metadata.idsubdatatable) {
                            row.idSubtable = metadata.idsubdatatable;
                        }

                        row.id       = index;
                        row.columns  = response.columns;
                        row.metadata = response.metadata;
                        row.prettyDate     = response.prettyDate;
                        row.reportMetadata = reportMetadata ? reportMetadata[index] : null;
                        row.hasDimension   = true;
                    
                        reportRow.push(row);
                    }
                    
                } else if (_.isObject(reportData)) {
                    // since Piwik Server 1.5.0: for reports with no dimensions, like VisitsSummary.get

                    for (var key in reportData) {

                        label     = key;
                        if (response.columns && response.columns[key]) {
                            label = response.columns[key];
                        }
                        
                        value = reportData[key];

                        row = reportData;
                        row.title = label;
                        row.value = value;
                        row.id       = reportRow.length;
                        row.columns  = response.columns;
                        row.metadata = response.metadata;
                        row.prettyDate     = response.prettyDate;
                        row.reportMetadata = reportMetadata ? reportMetadata[key] : null;
                        row.hasDimension   = false;

                        reportRow.push(row);
                    }
                }
                
                response       = null;
                account        = null;
                metadata       = null;
                row            = null;
                report         = null;
                reportData     = null;
                reportMetadata = null;

                return reportRow;
            }

            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }
        
}

