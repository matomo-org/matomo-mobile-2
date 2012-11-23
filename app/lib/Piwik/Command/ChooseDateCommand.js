/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik       = require('library/Piwik');

/**
 * @class     Choose a date and a period command.
 * 
 * @param     {Object}       [params]               See {@link Piwik.UI.View#setParams} 
 * @param     {string}       [params.period="day"]  Optional. The current active period. 
 * @param     {Date|string}  [params.date]          Optional. The current selected date. Can be either a Date 
 *                                                  object or string in the following Format 
 *                                                  "YYYY-MM-DD". Defaults to the current date (now). 
 *
 * @exports   ChooseDateCommand as Piwik.Command.ChooseDateCommand
 * @augments  Piwik.UI.View
 */
function ChooseDateCommand () {
    
    /**
     * The event will be fired as soon as the user changes the daterange (date or period).
     * The event will be fired in multiple contexts.
     *
     * @name   Piwik.Command.ChooseDateCommand#event:onDateChanged
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type    The name of the event.
     * @param  {string}  event.date    The current active, possibly changed, date value in the format
     *                                 'YYYY-MM-DD'.
     * @param  {string}  event.period  The current active, possibly changed, period value. For example
     *                                 'day' or 'week'.
     */
}

/**
 * Extend Piwik.UI.View
 */
ChooseDateCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
ChooseDateCommand.prototype.getId = function () {
    return 'chooseDateCommand';
};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
ChooseDateCommand.prototype.getLabel = function () {

    var _  = require('library/underscore');
    
    return _('General_ChooseDate');
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns {Object}   The button label of the command.
 */
ChooseDateCommand.prototype.getButtonLabel = function () {};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
ChooseDateCommand.prototype.getMenuIcon = function () {};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
ChooseDateCommand.prototype.getMenuTrackingEvent = function () {
    return {title: 'Menu Click - Choose Date',
            url: '/menu-click/choose-date'};
};

/**
 * Execute the command. Opens a dialog where the user can choose another date/period. The date and the period 
 * parameter has to be set in order to execute this action. 
 */
ChooseDateCommand.prototype.execute = function (params) {
    
    if (!params) {
        params = {};
    }
    
    var period    = this.getParam('period', 'day');
    var date      = this.getParam('date', '');
 
    var piwikDate = Piwik.require('PiwikDate');
    piwikDate.setDate(date);
    piwikDate.setPeriod(period);
 
    var rangeDate = piwikDate.getRangeDate();
    var from      = rangeDate[0];
    var to        = rangeDate[1];
    
    var max       = new Date();
    var min       = new Date(2008, 0, 1);
    var picker    = this.create('DatePicker', {from: from,
                                               to: to,
                                               maxDate: max,
                                               period: period,
                                               selectionIndicator: true,
                                               source: params.source ? params.source : null,
                                               minDate: min});

    var that = this;
    picker.addEventListener('onSet', function (event) {
        that.changePeriod(event.period);
        that.changeDate(event.from, event.to, event.period);
    });
    
    params    = null;
    picker    = null;
    rangeDate = null;
    piwikDate = null;
};

/**
 * Undo the executed command.
 */
ChooseDateCommand.prototype.undo = function () {
    
};

/**
 * Changes the current selected period.
 *
 * @param  {string}  period  The selected period, for example 'week', 'year', ...
 */
ChooseDateCommand.prototype.changePeriod = function (period) {

    if (!period) {
    
        return;
    }

    var session = Piwik.require('App/Session');
    session.set('piwik_parameter_period', period);
    session     = null;
};

/**
 * Verifies which date is earlier.
 *
 * @param    {Date}     from  The selected/changed date.
 * @param    {Date}     to  The selected/changed date.
 *
 * @returns  {boolean}  true if the from 'date' is earlier than the 'to' date. False otherwise.
 */
ChooseDateCommand.prototype.isEarlier = function (from, to) {
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

/**
 * Changes the current selected date and fires an event named 'onDateChanged' using the object.
 * The passed event contains a property named 'date' which holds the changed value in the format 'YYYY-MM-DD' and a 
 * property named period which holds the selected period, for example 'week'. 
 *
 * @param  {Date}    changedDate  The selected/changed date.
 * @param  {string}  period       The selected/changed period.
 *
 * @fires  Piwik.Command.ChooseDateCommand#event:onDateChanged
 */
ChooseDateCommand.prototype.changeDate = function (from, to, period) {
    

    // make sure from is always earlier than to if period is range
    if ('range' == period && !this.isEarlier(from, to)) {
        var temp = from;
        from     = to;
        to       = temp;
    } 

    var piwikDate = Piwik.require('PiwikDate');
    var dateQuery = piwikDate.toPiwikQueryString(period, from, to);

    var session   = Piwik.require('App/Session');
    session.set('piwik_parameter_date', dateQuery);
    session       = null;
    piwikDate     = null;

    this.fireEventInWindow('onDateChanged', {date: dateQuery, period: period, type: 'onDateChanged'});
};

module.exports = ChooseDateCommand;