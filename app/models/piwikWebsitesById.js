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
        "cache": {time: 60 * 60 * 12, type: 'session'}, // 12 hours
        "settings": {
            "method": "SitesManager.getSiteFromId",
            "displayErrors": true
        },
        "defaultParams": {}
    },

    extendModel: function(Model) {
        _.extend(Model.prototype, {
            
            idAttribute: "idsite",

            getName: function () {
                return this.get('name');
            },
            getSiteId: function () {
                return this.get('idsite');
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {

            entrySite: function () {
                var entrysite  = this.first();
                if (!entrysite) {
                    return;
                }

                var attributes = entrysite.toJSON();

                var siteModel  = Alloy.createModel('PiwikWebsites', attributes);
                return siteModel;
            },
            
            validResponse: function (response) {

                return _.isArray(response) && _.has(response, 0);
            }

        }); // end extend
        
        return Collection;
    }
        
};