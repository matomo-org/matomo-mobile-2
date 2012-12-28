var Alloy = require('alloy');

exports.definition = {
    
    config: {
        "columns": {
            "language":"string",
            "trackingEnabled":"boolean",
            "graphsEnabled":"boolean",
            "preferEvolutionGraphs":"boolean",
            "httpTimeout":"integer"
        },
        "adapter": {
            "type": "properties",
            "collection_name": "settings"
        },
        defaults: {
            language: Alloy.CFG.settings.language,
            trackingEnabled: Alloy.CFG.settings.trackingEnabled,
            preferEvolutionGraphs: Alloy.CFG.settings.preferEvolutionGraphs,
            graphsEnabled: Alloy.CFG.settings.graphsEnabled,
            httpTimeout: Alloy.CFG.settings.httpTimeout
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

