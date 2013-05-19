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
            "collection_name": "piwikwebsitesbyid"
        },
        "settings": {
            "method": "SitesManager.getSiteFromId",
            "cache": true
        },
        "defaultParams": {}
    },

    extendModel: function(Model) {
        _.extend(Model.prototype, {
            
            idAttribute: "idsite",

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            entrySite: function () {
                var entrysite  = this.first();
                var attributes = entrysite.toJSON();

                var siteModel  = Alloy.createModel('PiwikWebsites', attributes);
                return siteModel;
            }

        }); // end extend
        
        return Collection;
    }
        
}