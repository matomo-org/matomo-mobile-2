/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
            "collection_name": "piwikaccountpreference"
        },
        "cache": false,
        "settings": {
            "method": "API.getBulkRequest",
            "displayErrors": true
        },
        "defaultParams": {
            "urls": [{method: "Live.getCounters", lastMinutes: 30, format: "JSON"},
                     {method: "Live.getCounters", lastMinutes: 1440, format: "JSON"},
                     {method: "Live.getLastVisitsDetails", filter_limit: 20, period: "day", date: "today", format: "JSON"}]
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
            fetchVisitors: function (account, segment, idSite, onSuccess, onError) {
                for (var index in this.config.defaultParams.urls) {
                    var defaultParam    = this.config.defaultParams.urls[index];
                    defaultParam.idSite = idSite;

                    if (segment) {
                        defaultParam.segment = segment.getDefinition();
                    } else if (defaultParam.segment) {
                        delete defaultParam.segment;
                    }
                }

                this.abortRunningRequests();

                this.fetch({
                    account: account,
                    segment: segment,
                    success: function (collection, response) {
                        if (!_.isArray(response)) {
                            return;
                        }

                        var last30Min      = response[0];
                        var last24Hours    = response[1];
                        var visitorDetails = response[2];

                        last30Min   = (last30Min && last30Min[0]) ? last30Min[0] : '-';
                        last24Hours = (last24Hours && last24Hours[0]) ? last24Hours[0] : '-';

                        if (onSuccess) {
                            onSuccess(account, last30Min, last24Hours, visitorDetails);
                            onSuccess = null;
                            onError   = null;
                            account = null;
                        }
                    },
                    error: function (collection, error) {
                        onError(collection, error);
                        onError   = null;
                        onSuccess = null;
                        account   = null;
                    }
                });

            },

            validResponse: function (response) {

                return _.isArray(response) && _.has(response, 0) && _.has(response, 1) && _.has(response, 2);
            }

            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
};

