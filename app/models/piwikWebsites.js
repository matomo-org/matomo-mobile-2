/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.definition = {
    
    config: {
        "columns": {
            "idsite":"integer",
            "name":"string",
            "main_url":"string",
            "ts_created":"string",
            "timezone":"string",
            "currency":"string",
            "excluded_ips":"integer",
            "excluded_parameters":"string",
            "sitesearch":"integer",
            "sitesearch_keyword_parameters":"string",
            "sitesearch_category_parameters":"string",
            "group":"string",
            "ecommerce":"integer"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwikwebsites"
        },
        "cache": {time: 60 * 60, type: 'session'}, // 1 hour
        "settings": {
            "method": "SitesManager.getSitesWithAtLeastViewAccess",
            "displayErrors": true
        },
        "defaultParams": {}
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {
            
            idAttribute: "idsite",
/*
            parse: function (response) {
                if (response && response[0]) {
                    return response[0];
                }
                
                return null;
            },
*/
            getName: function () {
                return this.get('name');
            },
            getSiteId: function () {
                return this.get('idsite');
            }

    
            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            validResponse: function (response) {

                if (!response || !response[0]) {
                    return false;
                }
                
                if (!response[0].idsite) {
                    return false;
                }
                
                return true;
            }
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
};

