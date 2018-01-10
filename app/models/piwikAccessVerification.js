/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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
            "collection_name": "piwikaccessverification"
        },
        "cache": false,
        "settings": {
            "method": "SitesManager.getSitesIdWithAtLeastViewAccess",
            "displayErrors": true
        },
        "defaultParams": {"limit": 1, "filter_limit": 1}
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {
            
            idAttribute: "idsite",

            getName: function () {
                return this.get('name');
            }

            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            hasAccessToAtLeastOneWebsite: function () {
                return !!this.length;
            },

            validResponse: function (response) {

                return (response && _.isArray(response));
            }
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

