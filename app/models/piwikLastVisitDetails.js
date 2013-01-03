var Alloy = require('alloy');

exports.definition = {
    
    config: {
        "columns": {
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwiklastvisitdetails"
        },
        "settings": {
            "method": "Live.getLastVisitsDetails",
            "cache": false
        },
        "defaultParams": {
            showSubtableReports: 0,
            hideMetricsDoc: 1, 
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

