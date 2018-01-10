/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function doesNotContainWhitespace (url) {
    return -1 == ('' + url).indexOf(' ');
}

exports.definition = {
    // TODO get filter limit from config
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
        "cache": false,
        "settings": {
            "method": "API.getProcessedReport",
            "displayErrors": true
        },
        "defaultParams": {
            hideMetricsDoc: 1, 
            showTimer: 0,
            filter_limit: 40,
            format_metrics: '1'
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

                if (metadata && metadata.logo && doesNotContainWhitespace(metadata.logo)) {
                    return metadata.logo;
                }

                return null;
            },
            getLogoWidth: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.logoWidth) {
                    return metadata.logoWidth;
                }

                return null;
            },
            getLogoHeight: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.logoHeight) {
                    return metadata.logoHeight;
                }

                return null;
            },
            getSubtableId: function () {
                var metadata = this.getReportMetadata();

                if (metadata && metadata.idsubdatatable) {
                    return metadata.idsubdatatable;
                }

                return null;
            }

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
            hasReportDimension: true,

            hasDimension: function () {
                return this.hasReportDimension;
            },

            hasReports: function () {
                return !!this.getNumberOfReports();
            },

            getNumberOfReports: function () {
                return this.length;
            },

            getModule: function () {
                var metadata = this.getMetadata();

                if (metadata && metadata.module) {
                    return metadata.module;
                }
            },

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

                return '';
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

            setSortOrder: function (sortOrderColumn) {
                this.sortOrderColumn = sortOrderColumn;
            },

            fetchProcessedReports: function (sortOrderColumn, options) {

                if (!options) {
                    options = {};
                }
                if (!options.params) {
                    options.params = {};
                }

                this.setSortOrder(sortOrderColumn);

                options.params.sortOrderColumn    = sortOrderColumn;
                options.params.filter_sort_column = sortOrderColumn;
                options.reset = true;

                this.abortRunningRequests();
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

                if (_.isArray(reportData)) {
                    this.hasReportDimension = true;

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

                        if (!_.isUndefined(report[this.sortOrderColumn])
                            && !_.isNull(report[this.sortOrderColumn])) {
                            value = report[this.sortOrderColumn];
                        }

                        if (_.isUndefined(value) || _.isNull(value)) {
                            value = '-';
                        }

                        if (metadata && metadata.shortLabel) {
                            // always prefer the sortLabel
                            label = metadata.shortLabel;
                        }

                        if (label) {
                            label = ('' + label).replace(/^\s+/g, "");
                        }

                        row = report;
                        row.title = label;
                        row.value = value;
                        row.id    = index;
                        row.reportMetadata  = metadata;
                        row.sortOrderColumn = this.sortOrderColumn;
                        row.hasDimension    = this.hasReportDimension;
                    
                        rows.push(row);
                    }
                    
                } else if (_.isObject(reportData)) {
                    this.hasReportDimension = false;
                    // since Piwik Server 1.5.0: for reports with no dimensions, like VisitsSummary.get

                    for (var key in reportData) {

                        label     = key;
                        if (response.columns && response.columns[key]) {
                            label = response.columns[key];
                        }
                        
                        value = reportData[key];

                        if (_.isUndefined(value) || _.isNull(value)) {
                            value = '-';
                        }
                        
                        row = _.clone(reportData);
                        row.title = label;
                        row.value = value;
                        row.id    = rows.length;
                        row.reportMetadata  = reportMetadata ? reportMetadata[key] : null;
                        row.sortOrderColumn = key;
                        row.hasDimension    = this.hasReportDimension;

                        rows.push(row);
                    }
                }

                response       = null;
                metadata       = null;
                row            = null;
                report         = null;
                reportData     = null;
                reportMetadata = null;

                return rows;
            },

            validResponse: function (response) {

                return !!response;
            }
            
        }); // end extend
        
        return Collection;
    }
        
};

