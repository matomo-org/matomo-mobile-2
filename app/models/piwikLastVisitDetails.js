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

            usedMaxVisitIds: [],

            date: null,

            parseDate: function () {
                var date = this.date;

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
                this.date = date; 

                this.fetch({
                    account: account,
                    params: {filter_limit: 10, 
                             idSite: idSite,
                             date: this.parseDate()}
                });
            },

            previous: function (account, idSite) {

                var lastVisitId = this.last().get('idVisit');

                // store the previous used oldestVisitId. This makes sure we can display the same previous users
                this.usedMaxVisitIds.push(lastVisitId);

                this.fetch({
                    account: account,
                    params: {maxIdVisit: lastVisitId,
                             idSite: idSite,
                             filter_limit: Alloy.CFG.piwik.filterLimit, 
                             date: this.parseDate()}
                });
            },

            next: function (account, idSite) {

                var params = {idSite: idSite,
                              filter_limit: Alloy.CFG.piwik.filterLimit, 
                              date: this.parseDate()};

                if (this.usedMaxVisitIds && this.usedMaxVisitIds.length) {
                    // remove the previous displayed maxVisitId from stack
                    params.maxIdVisit = this.usedMaxVisitIds.pop();
                }

                // if there is no previousUsedMaxIdVisit given, request by minTimestamp. We always prefer maxIdVisit here
                // cause when maxIdVisit is used, we get the users sorted by VisitId/firstVisitTime
                if (!params.maxIdVisit) {
                    params.minTimestamp = this.first().get('firstActionTimestamp');
                }

                this.fetch({account: account, params: params});
            }
            
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

