function changePeriod (period) 
{
    if (!period) {
    
        return;
    }

    var session = require('Piwik/App/Session');
    session.set('piwik_parameter_period', period);
    session     = null;

    return period;
};

function isEarlier (from, to) 
{
    if (!from) {
        
        return false;
    }
    
    if (!to) {
        
        return true;
    }
    
    var fromTimestamp = (from.getTime() / 1000);
    var toTimestamp   = (to.getTime() / 1000);

    if (fromTimestamp < toTimestamp) {
        
        return true;
    } 
    
    return false;
};

function changeDate (from, to, period)
{
    // make sure from is always earlier than to if period is range
    if ('range' == period && !isEarlier(from, to)) {
        var temp = from;
        from     = to;
        to       = temp;
    } 

    var piwikDate = new (require('Piwik/PiwikDate'));
    var dateQuery = piwikDate.toPiwikQueryString(period, from, to);

    var session   = require('Piwik/App/Session');
    session.set('piwik_parameter_date', dateQuery);
    session       = null;
    piwikDate     = null;

    return dateQuery;
};

exports.execute = function (params, onDateChosen)
{
    if (!params) {
        params = {};
    }
    
    var period    = params.period ? params.period : 'day';
    var date      = params.date ? params.date : ''
 
    var piwikDate = new (require('Piwik/PiwikDate'));
    piwikDate.setDate(date);
    piwikDate.setPeriod(period);
 
    var rangeDate = piwikDate.getRangeDate();
    var from      = rangeDate[0];
    var to        = rangeDate[1];
    
    var max       = new Date();
    var min       = new Date(2008, 0, 1);
    var picker    = Alloy.createController('datechooser', {from: from,
                                                           to: to,
                                                           maxDate: max,
                                                           period: period,
                                                           selectionIndicator: true,
                                                           source: params.source ? params.source : null,
                                                           minDate: min});

    picker.on('onSet', function (event) {
        var period    = changePeriod(event.period);
        var dateQuery = changeDate(event.from, event.to, event.period);

        onDateChosen(period, dateQuery);
    });
    
    picker.open();
}