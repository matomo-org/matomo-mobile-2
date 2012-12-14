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
        "settings": {
            "method": "SitesManager.getSitesWithAtLeastViewAccess",
            "cache": true
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
            }

    
            // extended functions go here

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            getEntrySite: function (response) {
                return this.first();
            },

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
        
}

