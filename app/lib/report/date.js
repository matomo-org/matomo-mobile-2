/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function detectPeriodFromReportDate(reportDate)
{
    var reportDateToPeriodMapping = {week: 'week', month: 'month', year: 'year', previous30: 'range', 
                                     previous7: 'range', last7: 'range', last30: 'range'};

    if (reportDate && reportDateToPeriodMapping[reportDate]) {
        return reportDateToPeriodMapping[reportDate];
    }

    return 'day';
}

function detectDateFromReportDate(reportDate)
{
    var reportDateToDateMapping = {week: 'today', month: 'today', year: 'today'};

    if (reportDate && reportDateToDateMapping[reportDate]) {
        return reportDateToDateMapping[reportDate];
    }

    return reportDate;
}

function ReportDate()
{
    this.period = null;
    this.date   = null;
}

/**
 * Sets (overwrites) the current date.
 *
 * @param  {string}  date  A date in format 'YYYY-MM-DD' or 'YYYY-MM-DD,YYYY-MM-DD' or something like 'today' or 
 *                        'yesterday'
 */
ReportDate.prototype.setDate = function (date) {
    this.date = date;
};

ReportDate.prototype.getDate = function () {
    return this.date;
};

/**
 * Sets (overwrites) the current period.
 *
 * @param  {string}  period  A period like 'week' or 'range'.
 */
ReportDate.prototype.setPeriod = function (period) {
    this.period = period;
};

ReportDate.prototype.getPeriod = function () {
    return this.period;
};

ReportDate.prototype.getPeriodQueryString = function () {
    return this.period;
};

ReportDate.prototype.getDateQueryString = function () {
    return this.date;
};

/**
 * Sets (overwrites) the current period and date.
 *
 * @param  {string}  ReportDate  A report date (eg from Piwik settings) like 'week' or 'last7'.
 */
ReportDate.prototype.setReportDate = function (reportDate) {
    this.period = detectPeriodFromReportDate(reportDate);
    this.date   = detectDateFromReportDate(reportDate);
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
ReportDate.prototype.getRangeDate = function () {
    if (!this.date) {
        
        return [new Date(), new Date()];
    }
    
    var fromDate = null;
    var toDate   = null;

    var moment = require('moment/moment');
    
    if ('last7' == this.date) {

        fromDate = moment().subtract('days', 6).toDate();
        toDate   = new Date();
        
    } else if ('last30' == this.date) {
        
        fromDate = moment().subtract('days', 29).toDate();
        toDate   = new Date();
        
    } else if ('previous7' == this.date) {
        
        fromDate = moment().subtract('days', 7).toDate();
        toDate   = moment().subtract('days', 1).toDate();
        
    } else if ('previous30' == this.date) {
        
        fromDate = moment().subtract('days', 30).toDate();
        toDate   = moment().subtract('days', 1).toDate();
        
    } else if ('week' == this.period) {

        fromDate = this.toDate(this.date);
        toDate   = this.toDate(this.date);
        if (0 === fromDate.getDay()) {
            fromDate = moment().subtract('days', 7).toDate();
            toDate   = moment().subtract('days', 7).toDate();
        }

        fromDate.setDate(fromDate.getDate() - fromDate.getDay() + 1);
        toDate.setDate(toDate.getDate() + (7 - toDate.getDay()));
    
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
ReportDate.prototype.getAvailableDateRanges = function () {

    var L = require('L');
    
    var ranges = [{label: L('General_Today'), period: 'day', date: 'today'},
                  {label: L('General_Yesterday'), period: 'day', date: 'yesterday'},
                  {label: String.format(L('General_PreviousDaysShort'), '7'), period: 'range', date: 'previous7'},
                  {label: String.format(L('General_PreviousDaysShort'), '30'), period: 'range', date: 'previous30'},
                  {label: String.format(L('General_LastDaysShort'), '7'), period: 'range', date: 'last7'},
                  {label: String.format(L('General_LastDaysShort'), '30'), period: 'range', date: 'last30'},
                  {label: L('General_CurrentWeek'), period: 'week', date: 'today'},
                  {label: L('General_CurrentMonth'), period: 'month', date: 'today'},
                  {label: L('General_CurrentYear'), period: 'year', date: 'today'}];

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
ReportDate.prototype.getAvailablePeriods = function () {
    
    var L = require('L');
    
    var periods = {day:   L('CoreHome_PeriodDay'),
                   week:  L('CoreHome_PeriodWeek'),
                   month: L('CoreHome_PeriodMonth'),
                   year:  L('CoreHome_PeriodYear'),
                   range: L('CoreHome_PeriodRange')};

    return periods;
};

/**
 * Parses a string - which is in the following format '2010-05-12' - and converts it to a Date object. 
 * This format is used in piwik rest calls.
 * 
 * @param    {string}  str
 *
 * @example
 * require('report/date').toDate('2010-05-31');
 *
 * @returns  {Date}    The created date object.
 */
ReportDate.prototype.toDate = function (str) {

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
 * require('report/date').toPiwikQueryString('range', from, to); // outputs '2010-05-24,2011-06-27'
 *
 * @returns  {string}  The in Piwik API required date format.
 */
ReportDate.prototype.toPiwikQueryString = function (period, from, to) {
    
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

module.exports = ReportDate;