/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var settingDefaults = Alloy.CFG.settings;

var modelSingleton = null;

exports.definition = {
    
    config: {
        "columns": {
            "language":"string",
            "trackingEnabled":"boolean",
            "graphsEnabled":"boolean",
            "preferEvolutionGraphs":"boolean",
            "httpTimeout":"integer",
            "reportDate": "string",
            "validateSsl": "boolean"
        },
        "adapter": {
            "type": "properties",
            "collection_name": "appsettings"
        },
        defaults: {
            id: 1,
            language: settingDefaults.locale,
            trackingEnabled: settingDefaults.trackingEnabled,
            preferEvolutionGraphs: settingDefaults.preferEvolutionGraphs,
            graphsEnabled: settingDefaults.graphsEnabled,
            httpTimeout: settingDefaults.httpTimeout,
            validateSsl: null
        }
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {
            setLanguageCode: function (langCode) {
                return this.set('language', langCode);
            },

            languageCode: function () {
                return this.get('language');
            },

            setValidateSsl: function (shouldValidateSsl) {
                return this.set('validateSsl', shouldValidateSsl);
            },

            shouldValidateSsl: function () {
                if (this.hasConfiguredValidateSsl()) {
                    return this.get('validateSsl');
                }

                return settingDefaults.validateSsl;
            },

            hasConfiguredValidateSsl: function () {
                return this.has('validateSsl');
            },

            setTrackingEnabled: function (isTrackingEnabled) {
                return this.set('trackingEnabled', isTrackingEnabled);
            },

            isTrackingEnabled: function () {
                return this.get('trackingEnabled');
            },

            setGraphsEnabled: function (areGraphsEnabled) {
                return this.set('graphsEnabled', areGraphsEnabled);
            },

            areGraphsEnabled: function () {
                return this.get('graphsEnabled');
            },

            setPreferEvolutionGraphs: function (doPreferEvolutionGraphs) {
                return this.set('preferEvolutionGraphs', doPreferEvolutionGraphs);
            },

            preferEvolutionGraphs: function () {
                return this.get('preferEvolutionGraphs');
            },

            setHttpTimeout: function (timeoutInMs) {
                return this.set('httpTimeout', timeoutInMs);
            },

            httpTimeout: function () {
                return this.get('httpTimeout');
            },

            getReportDate: function () {
                return this.get('reportDate');
            },

            getReportPeriod: function () {
                return this.get('reportPeriod');
            },

            hasReportDate: function () {
                return this.getReportDate() && this.getReportPeriod();
            },

            setReportDateAndPeriod: function (period, date) {
                this.set('reportPeriod', period);
                this.set('reportDate', date);
            }
                        
            // extended functions go here

        }); // end extend
        
        return Model;
    },
    

    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
            settings: function () {
                if (modelSingleton) {
                    return modelSingleton;
                }

                this.fetch();

                if (this.first()) {
                    modelSingleton = this.first();
                } else {
                    modelSingleton = new Alloy.createModel('appSettings');
                    modelSingleton.save();
                }

                return modelSingleton;
            }
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

