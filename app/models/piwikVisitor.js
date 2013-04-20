exports.definition = {
    
    config: {
        "columns": {
            "value":"string"
        },
        "adapter": {
            "type": "session",
            "collection_name": "piwikvisitor"
        },
        "settings": {
        }
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
        }); // end extend
        
        return Collection;
    }
        
}

