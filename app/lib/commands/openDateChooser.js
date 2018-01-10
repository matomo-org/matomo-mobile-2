/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
}

function formatDateToPiwikQuery (from, to, period)
{
    // make sure from is always earlier than to if period is range
    if ('range' == period && !isEarlier(from, to)) {
        var temp = from;
        from     = to;
        to       = temp;
    } 

    var piwikDate = new (require('report/date'));
    var dateQuery = piwikDate.toPiwikQueryString(period, from, to);

    return dateQuery;
}

exports.execute = function (params, onDateChosen)
{
    if (!params) {
        params = {};
    }
    
    var period    = params.period ? params.period : 'day';
    var date      = params.date ? params.date : '';
 
    var piwikDate = new (require('report/date'));
    piwikDate.setDate(date);
    piwikDate.setPeriod(period);
 
    var rangeDate = piwikDate.getRangeDate();
    var from      = rangeDate[0];
    var to        = rangeDate[1];
    
    var max       = new Date();
    var min       = new Date(2008, 0, 1);
    var picker    = Alloy.createController('date_chooser', {from: from,
                                                            to: to,
                                                            maxDate: max,
                                                            period: period,
                                                            selectionIndicator: true,
                                                            source: params.source ? params.source : null,
                                                            minDate: min});

    picker.on('onSet', function (event) {
        if (!event) {
            return;
        }

        var dateQuery = formatDateToPiwikQuery(event.from, event.to, event.period);

        onDateChosen(event.period, dateQuery);
    });
    
    picker.open();
};