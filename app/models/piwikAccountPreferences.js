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
            "cache": true
        },
        "defaultParams": {
            "urls": [{method: "UsersManager.getUserPreference", preferenceName: "defaultReport", format: "JSON"},
                     {method: "UsersManager.getUserPreference", preferenceName: "defaultReportDate", format: "JSON"}]
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
            fetchPreferences: function (account, success, error) {
                for (var index in this.config.defaultParams.urls) {
                    var defaultParam = this.config.defaultParams.urls[index];
                    defaultParam.userLogin = account.get('username');
                }

                this.fetch({
                    account: account, 
                    success: function (collection, response) {

                        var defaultReport     = JSON.parse(response[0]);
                        var defaultReportDate = JSON.parse(response[1]);

                        if (success) {
                            success(account, defaultReport.value, defaultReportDate.value);
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
        
}

