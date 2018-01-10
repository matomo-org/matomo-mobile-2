/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Alloy = require('alloy');
var numVisitorsToLoadInitially = 15;

exports.definition = {
    
    config: {
        "columns": {
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwiklastvisitdetails"
        },
        "cache": false,
        "settings": {
            "method": "Live.getLastVisitsDetails",
            "displayErrors": true
        },
        "defaultParams": {
            filter_limit: numVisitorsToLoadInitially,
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

                    if (0 === date.indexOf('last') || 0 === date.indexOf('previous')) {
                        var reportDate = new (require('report/date'));
                        reportDate.setReportDate(date);
                        date = reportDate.toPiwikQueryString();
                    }

                    var positionComma = date.indexOf(',');
                    // API does not support date range format 'YYYY-MM-DD,YYYY-MM-DD'.
                    if (-1 !== date.indexOf(',')) {
                        date = date.substr(0, positionComma);
                    }
                }

                return date;
            },

            initial: function (account, segment, idSite, period, date) {
                if (!account) {
                    console.info('Unable to init lastVisitDetails, no account given');
                    return;
                }

                this.date   = date; 
                this.period = period;

                this.currentOffset = 0;
                this.nextOffset    = numVisitorsToLoadInitially;

                this.abortRunningRequests();
                this.fetch({
                    account: account,
                    segment: segment,
                    params: {filter_limit: numVisitorsToLoadInitially,
                             idSite: idSite,
                             period: this.getPeriod(),
                             date: this.parseDate()}
                });
            },

            previous: function (account, segment, idSite) {
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
                    segment: segment,
                    params: {filter_offset: this.currentOffset,
                             idSite: idSite,
                             filter_limit: filterLimit, 
                             period: this.getPeriod(),
                             date: this.parseDate()}
                });
            },

            next: function (account, segment, idSite) {
                if (!account) {
                    console.info('Unable to fetch next lastVisitDetails, no account given');
                    return;
                }

                var filterLimit = Alloy.CFG.piwik.filterLimit;
                this.nextOffset = this.currentOffset;
                this.currentOffset = this.currentOffset - filterLimit;

                if (0 > this.currentOffset) {
                    this.currentOffset = 0;
                    this.nextOffset    = numVisitorsToLoadInitially;
                }

                if (!this.nextOffset) {
                    this.nextOffset = numVisitorsToLoadInitially;
                }

                var params = {filter_offset: this.currentOffset,
                              idSite: idSite,
                              filter_limit: filterLimit,
                              period: this.getPeriod(), 
                              date: this.parseDate()};

                this.abortRunningRequests();
                this.fetch({account: account, segment: segment, params: params});
            },

            validResponse: function (response) {

                return _.isArray(response);
            }
            
            // extended functions go here           
            
        }); // end extend
        
        return Collection;
    }
        
}

