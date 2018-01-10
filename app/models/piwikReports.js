/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');

function extractReportsFromResponse (response) 
{
    if (!_.isArray(response) || !_.isArray(response[0])) {
        return [];
    } 

    return response[0];
}

function extractDashboardsFromResponse (response) 
{
    if (!_.isArray(response) || !_.isArray(response[1])) {
        return [];
    } 

    return response[1];
}

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
        "cache": {time: 60 * 60 * 24, type: 'session'},// 24 hours
        "settings": {
            "method": "API.getBulkRequest",
            "displayErrors": true
        },
        "defaultParams": {
            "urls": [{method: "API.getReportMetadata", hideMetricsDoc: 1, showSubtableReports: 0, format: "JSON",filter_limit: "-1"},
                     {method: "Dashboard.getDashboards", format: "JSON",filter_limit: "-1"}]
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {

            hasDimension: function () {
                return 'get' != this.get('action');
            },

            getMetricName: function () {
                var metrics   = this.getMetrics();
                var sortOrder = this.getSortOrder();

                if (metrics && metrics[sortOrder]) {
                    return metrics[sortOrder];
                }

                return '';
            },
            getReportName: function () {
                return this.get('name');
            },
            getModule: function () {
                return this.get('module');
            },
            getAction: function () {
                return this.get('action');
            },
            getUniqueId: function () {
                return this.get('uniqueId');
            },
            getMetrics: function () {
                return this.get('metrics');
            },

            getParameters: function () {
                return this.get('parameters');
            },

            hasParameters: function () {
                var params = this.getParameters();
                return _.isObject(params) && !_.isEmpty(params);
            },

            getSortOrder: function (metric) {

                if (metric) {
                    return metric;
                }

                var _             = require('alloy/underscore');
                var preferredRows = Alloy.CFG.piwik.preferredMetrics;
                var sortOrder     = _.first(preferredRows);
                
                var metrics = this.get('metrics');
                if (metrics) {

                    sortOrder = _.find(preferredRows, function (preferredRow) {
                        return !!(metrics[preferredRow]);
                    });

                    if (!sortOrder) {
                        for (var metricName in metrics) {
                            if (metrics.hasOwnProperty(metricName)) {
                                return metricName;
                            }
                        }
                    }
                }
                
                return sortOrder;
            }
            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {

        var findReportByWidgetInPreformattedReports = function (widget) {
            if (!widget) {
                return;
            }

            var module = widget.module;
            var action = widget.action;

            if (this.preformattedReports && 
                this.preformattedReports[module] && 
                this.preformattedReports[module][action]) {

                var report = this.preformattedReports[module][action];

                return _.clone(report);
            }
        };

        var resolveDashboardToReports = function (dashboard) {
            if (!dashboard) {
                return [];
            }
            
            var dashboardName = dashboard.name;
            var widgets       = dashboard.widgets;

            var reports = _.map(widgets, findReportByWidgetInPreformattedReports, this);
            reports     = _.compact(reports); 

            _.each(reports, function (report) {
                if (!report) {
                    return;
                }

                report.category    = dashboardName;
                report.isDashboard = true;
            });

            return reports;
        };

        var preformatReportsForFasterSearch = function (reports) {
            if (!reports) {
                return;
            }

            var formatted = {};

            for (var index = 0; index < reports.length; index++) {
                var report = reports[index];

                if (!report) {
                    continue;
                }

                var module = report.module;
                var action = report.action;

                if (!formatted[module]) {
                    formatted[module] = {};
                }

                formatted[module][action] = report;
            }

            return formatted;
        };

        _.extend(Collection.prototype, {

            preformattedReports: null,

            fetchAllReports: function (accountModel, siteModel) {
                if (!siteModel || !accountModel) {
                    console.info('Cannot fetch all reports, no account or site', 'piwikReports');
                    return;
                }

                this.config.defaultParams.urls[0].idSites = siteModel.get('idsite');
                this.config.defaultParams.urls[1].idSite  = siteModel.get('idsite');

                this.abortRunningRequests();
                this.fetch({
                    reset: true,
                    account: accountModel
                });
            },

            hasDashboardReport: function () {
                var firstReport = this.at(0);
                
                if (!firstReport) {
                    return false;
                }

                return this.at(0).get('isDashboard');
            },

            getFirstReportThatIsNotMultiSites: function () {
                var index = 0;
                while (this.at(index)) {
                    var module = this.at(index).getModule();

                    if ('MultiSites' != module) {
                        return this.at(index);
                    }

                    index++;
                }
            },

            containsReportCategory: function (category) {
                if (!category) {
                    return false;
                }

                var searchedModel = this.find(function (model) {
                    return model.get('category') == category;
                });

                return !!searchedModel;
            },

            getEntryReport: function () {

                if (this.hasDashboardReport()) {
                    return this.at(0);
                }

                var preferredReport = this.getFirstReportThatIsNotMultiSites();

                if (preferredReport) {
                    return preferredReport;
                }

                return this.at(0);
            },

            containsAction: function (searchReport) {
                if (!searchReport) {
                    return false;
                }

                var searchAction = searchReport.getAction();
                var searchModule = searchReport.getModule();

                var reports = this.where({action: searchAction, module: searchModule});
                return !!reports.length;
            },

            parse: function (response) {
                if (!response) {
                    return [];
                }

                var reports    = extractReportsFromResponse(response);
                var dashboards = extractDashboardsFromResponse(response);

                // TODO optimize algorithm from mapping of dashboards to reports
                this.preformattedReports = preformatReportsForFasterSearch(reports);

                var reportsToAdd = _.map(dashboards, resolveDashboardToReports, this);
                reportsToAdd     = _.flatten(reportsToAdd);

                while (reportsToAdd.length) {
                    reports.unshift(reportsToAdd.pop());
                }

                this.preformattedReports = null;

                return reports;
            },

            validResponse: function (response) {

                return _.isArray(response) && _.has(response, 0);
            }

            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }
        
};
