exports.definition = {
    
    config: {
        "columns": {
            "value":"string"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwikversion"
        },
        "settings": {
            "method": "API.getPiwikVersion",
            "cache": true,
            "displayErrors": false
        },
        "defaultParams": {
            limit: 1
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {

            getVersion: function () {
                return this.get('value');
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
            // extended functions go here            
            
        }); // end extend
        
        return Collection;
    }

};

