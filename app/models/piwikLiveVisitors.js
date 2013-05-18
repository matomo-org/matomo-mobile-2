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
        "settings": {
            "method": "API.getBulkRequest",
            "cache": false
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
            fetchVisitors: function (account, idSite, success, error) {
                for (var index in this.config.defaultParams.urls) {
                    var defaultParam    = this.config.defaultParams.urls[index];
                    defaultParam.idSite = idSite;
                }

                this.fetch({
                    account: account, 
                    success: function (collection, response) {

                        var last30Min   = JSON.parse(response[0]);
                        var last24Hours = JSON.parse(response[1]);
                        var visitorDetails = JSON.parse(response[2]);

                        if (success) {
                            success(account, last30Min[0], last24Hours[0], visitorDetails);
                            success = null;
                            account = null;
                        }
                    },
                    error: function () {
                        if (error) {
                            error(account);
                            error   = null;
                            account = null;
                        }
                    }
                });

            }

            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
};

