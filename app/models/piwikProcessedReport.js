
exports.definition = {
    
    config: {
        "columns": {
            "title":"string",
            "value":"string",
            "id":"string",
            "sortOrderColumn":"string",
            "hasDimension":"string",
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
            getTitle: function () {
                return this.get('title');
            },
            getValue: function () {
                return this.get('value');
            },
            getSortOrder: function () {
                return this.get('sortOrderColumn');
            },
            getReportMetadata: function () {
                return this.get('reportMetadata');
            },
            hasLogo: function () {
                return !!this.getLogo();
            },
            getLogo: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.logo) {
                    return metadata.logo;
                }
            },
            getLogoWidth: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.logoWidth) {
                    return metadata.logoWidth;
                }
            },
            getLogoHeight: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.logoHeight) {
                    return metadata.logoHeight;
                }
            },
            getSubtableId: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.idsubdatatable) {
                    return metadata.idsubdatatable;
                }
            }
            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            // TODO set config.defaultParams.filter_sort_column|sortOrderColumn
            sortOrderColumn: null,
            metadata: null,
            prettyDate: null,
            website: null,
            columns: null,

            getMetadata: function () {
                return (this.metadata || {});
            },

            hasSubtable: function () {
                 return !!this.getActionToLoadSubTables();
            },
            getActionToLoadSubTables: function () {
                var metadata = this.getMetadata();

                if (metadata && metadata.actionToLoadSubTables) {
                    return metadata.actionToLoadSubTables;
                }
            },

            getMetrics: function () {
                return (this.columns || {});
            },
            getMetricName: function () {
                var metrics = this.getMetrics();
                var sortOrder = this.getSortOrder();

                if (metrics && metrics[sortOrder]) {
                    return metrics[sortOrder];
                }

                return ''
            },

            getReportDate: function () {
                return this.prettyDate;
            },

            getReportName: function () {
                if (this.metadata && this.metadata.name) {
                    return this.metadata.name;
                }
                return '';
            },

            getEvolutionImageGraphUrl: function () {
                if (!this.metadata || !this.metadata.imageGraphEvolutionUrl) {
                    return '';
                }

                return this.metadata.imageGraphEvolutionUrl;
            },
            getImageGraphUrl: function () {
                if (!this.metadata || !this.metadata.imageGraphUrl) {
                    return '';
                }

                return this.metadata.imageGraphUrl;
            },

            getSortOrder: function () {
                return this.sortOrderColumn;
            },

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

                this.metadata = response.metadata;
                this.website  = response.website;
                this.prettyDate = response.prettyDate;
                this.columns  = response.columns;
                    
                var rows = [];
                var label;
                var value;
                var row;
                var metadata;
                var report;
                
                var reportData     = response.reportData;
                var reportMetadata = response.reportMetadata;

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
                        row.id       = index;
                        row.reportMetadata  = metadata
                        row.sortOrderColumn = this.sortOrderColumn;
                        row.hasDimension    = true;
                    
                        rows.push(row);
                    }
                    
                } else if (_.isObject(reportData)) {
                    // since Piwik Server 1.5.0: for reports with no dimensions, like VisitsSummary.get

                    for (var key in reportData) {

                        label     = key;
                        if (response.columns && response.columns[key]) {
                            label = response.columns[key];
                        }
                        
                        value = reportData[key];

                        row = _.clone(reportData);
                        row.title = label;
                        row.value = value;
                        row.id    = rows.length;
                        row.sortOrderColumn = key;
                        row.reportMetadata  = reportMetadata ? reportMetadata[key] : null;
                        row.hasDimension    = false;

                        rows.push(row);
                    }
                }

                response       = null;
                account        = null;
                metadata       = null;
                row            = null;
                report         = null;
                reportData     = null;
                reportMetadata = null;

                return rows;
            }

            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }
        
}

