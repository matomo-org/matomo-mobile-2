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
            filter_limit: 10,
            period: "day", 
            date: "today"
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

            parseDate: function (date) {

                if (date) {
                    date = '' + date;
                    var positionComma = date.indexOf(',');
                    
                    // API does not support date range format 'YYYY-MM-DD,YYYY-MM-DD'.
                    if (-1 !== date.indexOf(',')) {
                        date = date.substr(0, positionComma);
                    }
                }

                return date;
            },

            initial: function (account, idSite, date) {
                this.fetch({
                    account: account,
                    params: {filter_limit: 10, 
                             date: this.parseDate(date)}
                });
            },

            previous: function (account, idSite) {
                this.fetch({
                    account: account,
                    params: {maxIdVisit: this.maxIdVisit,
                             filter_limit: Alloy.CFG.piwik.filterLimit, 
                             date: this.parseDate(date)}
                });
            },

            next: function (account, idSite) {
                this.fetch({
                    account: account,
                    params: {minTimestamp: this.minTimestamp,
                             filter_limit: Alloy.CFG.piwik.filterLimit, 
                             date: this.parseDate(date)}
                });
            }
            
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

