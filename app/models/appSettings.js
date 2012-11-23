exports.definition = {
    
    config: {
        "columns": {
            "piwikLanguage":"string",
            "piwikMultiChart":"boolean",
            "trackingEnabled":"boolean",
            "graphsEnabled":"boolean",
            "preferEvolutionGraphs":"boolean",
            "httpTimeout":"integer",
            "piwikDefaultReportDate":"string"
        },
        "adapter": {
            "type": "properties",
            "collection_name": "settings"
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

