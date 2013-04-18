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
            "collection_name": "piwikentrysite"
        },
        "settings": {
            "method": "API.getPiwikVersion",
            "cache": true,
            // older Piwik versions < 1.8 don't support API.getPiwikVersion. Makes sure those users won't get an error meesage.
            "displayErrors": false
        },
        "defaultParams": {
            limit: 1
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
            
            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }
        
}

