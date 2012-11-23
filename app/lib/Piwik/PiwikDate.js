/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik   = require('library/Piwik');
 
/**
 * @class    The PiwikDate class provides some useful methods to handle the Piwik Date/Period. For example converting
 *           a Piwik string to a Date object.
 *
 * @exports  PiwikDate as Piwik.PiwikDate
 */
function PiwikDate () {

    /**
     * The current set date.
     *
     * @type  string
     */
    this.date   = null;
    
    /**
     * The current set period.
     *
     * @defaults  "day"
     *
     * @type      string
     */
    this.period = 'day';
}

/**
 * Sets (overwrites) the current date.
 *
 * @param  {string}  date  A date in format 'YYYY-MM-DD' or 'YYYY-MM-DD,YYYY-MM-DD' or something like 'today' or 
 *                        'yesterday'
 */
PiwikDate.prototype.setDate = function (date) {
    this.date = date;
};

/**
 * Sets (overwrites) the current period.
 *
 * @param  {string}  period  A period like 'week' or 'range'.
 */
PiwikDate.prototype.setPeriod = function (period) {
    this.period = period;
};

/**
 * Parses the previous set date string to convert them into the corresponding date objects.
 *
 * @returns  {Array}  Retruns two values. The first value is the 'from' date, the second is the 'to' date.
 *                    Array (
 *                      [0] => [{Date}, 'from' date]
 *                      [1] => [{Date}, 'to' date]  
 *                    )
 */
PiwikDate.prototype.getRangeDate = function () {
    if (!this.date) {
        
        return [new Date(), new Date()];
    }
    
    var fromDate = null;
    var toDate   = null;
    
    if ('last7' == this.date) {
        
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 6);
        toDate   = new Date();
        
    } else if ('last30' == this.date) {
        
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 29);
        toDate   = new Date();
        
    } else if ('previous7' == this.date) {
        
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        toDate   = new Date();
        toDate.setDate(toDate.getDate() - 1);
        
    } else if ('previous30' == this.date) {
        
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
        toDate   = new Date();
        toDate.setDate(toDate.getDate() - 1);
        
    } else if (-1 != this.date.indexOf(',')) {
        
        var fromAndTo = this.date.split(',');

        fromDate      = this.toDate(fromAndTo[0]);
        toDate        = this.toDate(fromAndTo[1]);
        
    } else {
        
        fromDate      = this.toDate(this.date);
        toDate        = new Date();
    }

    return [fromDate, toDate];
};

/**
 * Get a list of all date ranges which are supported within the Mobile App.
 *
 * @returns  {Array}  An object containing the label, the period and the date.
 *                    Array (
 *                        [int] => Object (
 *                            [label]  => [The name of the date range]
 *                            [period] => [The Piwik period, for example 'range']  
 *                            [date]   => [The piwik date, for example 'last7']  
 *                        )
 *                    )
 */
PiwikDate.prototype.getAvailableDateRanges = function () {

    var _      = require('library/underscore');
    
    var ranges = [{label: _('General_Today'), period: 'day', date: 'today'},
                  {label: _('General_Yesterday'), period: 'day', date: 'yesterday'},
                  {label: String.format(_('General_PreviousDaysShort'), '7'), period: 'range', date: 'previous7'},
                  {label: String.format(_('General_PreviousDaysShort'), '30'), period: 'range', date: 'previous30'},
                  {label: String.format(_('General_LastDaysShort'), '7'), period: 'range', date: 'last7'},
                  {label: String.format(_('General_LastDaysShort'), '30'), period: 'range', date: 'last30'},
                  {label: _('General_CurrentWeek'), period: 'week', date: 'today'},
                  {label: _('General_CurrentMonth'), period: 'month', date: 'today'},
                  {label: _('General_CurrentYear'), period: 'year', date: 'today'}];

    _ = null;

    return ranges;
};

/**
 * Get a list of periods which are supported within the Mobile App.
 *
 * @returns  {Object}  An object containing the Piwik internal name and the human readable translated name.
 *                     Object (
 *                         [{string}, Piwik internal name, eg 'day'] => [string Human readble format, eg 'Day']
 *                     )
 */
PiwikDate.prototype.getAvailablePeriods = function () {
    
    var _       = require('library/underscore');
    
    var periods = {day:   _('CoreHome_PeriodDay'),
                   week:  _('CoreHome_PeriodWeek'),
                   month: _('CoreHome_PeriodMonth'),
                   year:  _('CoreHome_PeriodYear'),
                   range: _('CoreHome_PeriodRange')};

    _ = null;

    return periods;
};

/**
 * Parses a string - which is in the following format '2010-05-12' - and converts it to a Date object. 
 * This format is used in piwik rest calls.
 * 
 * @param    {string}  str
 *
 * @example
 * Piwik.require('PiwikDate').toDate('2010-05-31');
 *
 * @returns  {Date}    The created date object.
 */
PiwikDate.prototype.toDate = function (str) {

    if (!str || 'today' == str) {
    
        return new Date();
    }

    if ('yesterday' == str) {
        var now = new Date();
        
        now.setDate(now.getDate() - 1);
        
        return now;
    }

    var changedDate = ('' + str).split('-');
    
    var formatDate  = null;
    if (3 <= changedDate.length) {
        formatDate  = new Date(changedDate[0], changedDate[1] - 1, changedDate[2]);
    } else if (2 === changedDate.length) {
        formatDate  = new Date(changedDate[0], changedDate[1] - 1, 1);
    } else if (1 === changedDate.length) {
        formatDate  = new Date(changedDate[0], 0, 1);
    }

    return formatDate;
};

/**
 * Formats a string which can be used within the url query part of an Piwik API request. The query string will be
 * generated depending on the given period, from date and to date.
 *
 * @param    {string}  period
 * @param    {Date}    from
 * @param    {Date}    to
 * 
 * @example
 * var from = new Date(2010, 05, 24);
 * var to   = new Date(2011, 06, 27);
 * Piwik.require('PiwikDate').toPiwikQueryString('range', from, to); // outputs '2010-05-24,2011-06-27'
 *
 * @returns  {string}  The in Piwik API required date format.
 */
PiwikDate.prototype.toPiwikQueryString = function (period, from, to) {
    
    if (!from) {
        from = new Date();
    }

    var month = from.getMonth() + 1;
    var year  = from.getYear() + 1900;
    var day   = from.getDate();

    if (month < 10) {
        month = '0' + month;
    }
    
    var dateString = String(year) + '-' + String(month) + '-' + String(day);
    
    if ('range' != period) {
        
        return dateString;
    }
    
    // range dateQuery always requires a second value
    if (!to) {
        to = new Date();
    }

    month = to.getMonth() + 1;
    year  = to.getYear() + 1900;
    day   = to.getDate();
    
    if (month < 10) {
        month = '0' + month;
    }
    
    dateString = dateString + ',' + String(year) + '-' + String(month) + '-' + String(day);
    
    return dateString;
};

module.exports = PiwikDate;