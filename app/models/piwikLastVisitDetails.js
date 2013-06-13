/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
            filter_limit: 15,
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

            currentOffset: 0,
            nextOffset: 0,

            date: null,
            period: null,

            getPeriod: function () {
                if ('range' == this.period) {
                    return 'month';
                }

                return this.period;
            },

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

            initial: function (account, idSite, period, date) {
                if (!account) {
                    console.info('Unable to init lastVisitDetails, no account given');
                    return;
                }

                this.date   = date; 
                this.period = period;

                this.currentOffset = 0;
                this.nextOffset    = 15;

                this.abortRunningRequests();
                this.fetch({
                    account: account,
                    params: {filter_limit: 15, 
                             idSite: idSite,
                             period: this.getPeriod(),
                             date: this.parseDate()}
                });
            },

            previous: function (account, idSite) {
                if (!account) {
                    console.info('Unable to fetch previous lastVisitDetails, no account given');
                    return;
                }

                var filterLimit    = Alloy.CFG.piwik.filterLimit;
                this.currentOffset = this.nextOffset;
                this.nextOffset    = this.currentOffset + filterLimit;

                this.abortRunningRequests();
                this.fetch({
                    account: account,
                    params: {filter_offset: this.currentOffset,
                             idSite: idSite,
                             filter_limit: this.nextOffset, 
                             period: this.getPeriod(),
                             date: this.parseDate()}
                });
            },

            next: function (account, idSite) {
                if (!account) {
                    console.info('Unable to fetch next lastVisitDetails, no account given');
                    return;
                }

                var filterLimit = Alloy.CFG.piwik.filterLimit;
                this.nextOffset = this.currentOffset;
                this.currentOffset = this.currentOffset - filterLimit;

                if (0 > this.currentOffset) {
                    this.currentOffset = 0;
                }

                if (!this.nextOffset) {
                    this.nextOffset = 15;
                }

                var params = {filter_offset: this.currentOffset,
                              idSite: idSite,
                              filter_limit: this.nextOffset,
                              period: this.getPeriod(), 
                              date: this.parseDate()};

                this.abortRunningRequests();
                this.fetch({account: account, params: params});
            },

            validResponse: function (response) {

                return _.isArray(response);
            }
            
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

