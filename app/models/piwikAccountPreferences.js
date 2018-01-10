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
        "cache": {time: 60 * 60 * 24, type: 'persistent'},// 24hours
        "settings": {
            "method": "API.getBulkRequest",
            "displayErrors": false
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
                if (!account) {
                    console.warn('Unable to fetch preferences, no account');
                    return;
                }

                for (var index in this.config.defaultParams.urls) {
                    var defaultParam = this.config.defaultParams.urls[index];
                    defaultParam.userLogin = account.get('username');
                }

                this.fetch({
                    account: account, 
                    success: function (collection, response) {
                        if (!_.isArray(response)) {
                            return;
                        }

                        var defaultReport     = response[0];
                        var defaultReportDate = response[1];

                        if (success) {
                            success(account, defaultReport, defaultReportDate);
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

            },

            validResponse: function (response) {

                return _.isArray(response) && _.has(response, 0) && _.has(response, 1) && response[0] && response[1];
            }

            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
};

