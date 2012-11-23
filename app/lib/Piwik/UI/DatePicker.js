/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');
 
/**
 * @class     A date picker is created by the method Piwik.UI.createDatePicker. A date picker can be used to select a
 *            date within a given range. The date picker does also allow to select a period like 'day' or 'range'.
 *            The picker will be opened within an OptionDialog. The user has the possiblity to select a date range or
 *            to cancel the whole process. If the selected period is range, the user has the possibility to set two
 *            dates. From and to. Otherwise the user is just able to set the 'from' date.
 * 
 * @see       <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.Picker-object">Titanium.UI.Picker</a>
 *
 * @exports   DatePicker as Piwik.UI.DatePicker
 * @augments  Piwik.UI.View 
 */
function DatePicker () {

    /**
     * This event will be fired as soon as the user confirms the selected/changed date. It is not triggered on
     * each change.
     *
     * @name   Piwik.UI.DatePicker#event:onSet
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type    The name of the event.
     * @param  {Date}    event.from    The current selected 'from' date. 
     * @param  {Date}    event.to      The current selected 'to' date. You only need this if period==range.
     * @param  {string}  event.period  The current selected period, for example 'day'.
     */

    /**
     * The currently selected 'from' date. 
     *
     * @type  Date
     */
    this.from       = new Date();
    
    /**
     * The currently selected 'to' date. 
     *
     * @type  Date
     */
    this.to         = new Date();

    /**
     * The currently selected period.
     *
     * @defaults  "day"
     *
     * @type      string
     */
    this.period     = 'day';

    /**
     * A view which contains the 'to date picker'. Needed to show/hide the 'to date picker' depending on the current
     * selected period.
     *
     * @type  null|Ti.UI.View
     */
    this.toDateView = null;

    /**
     * A label which displays the title of the 'from date picker'. Needed to change the text of the label depending on 
     * the current selected period.
     *
     * @type  null|Ti.UI.Label
     */
    this.fromLabel  = null;
}

/**
 * Extend Piwik.UI.View
 */
DatePicker.prototype = Piwik.require('UI/View');

/**
 * Renders the date picker.
 *
 * @param  {Object}  params          See <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.Picker-object.html">Titanium API</a> for a list of all available picker parameters.
 * @param  {Date}    [params.from]   The currently selected 'from' date
 * @param  {Date}    [params.to]     The currently selected 'to' date
 * @param  {Date}    params.minDate  The minimum date for both 'from' and 'to' date picker
 * @param  {Date}    params.maxDate  The maximum date for both 'from' and 'to' date picker
 * @param  {string}  params.period   The currently active period. Eg. 'day', 'week', 'range'
 *
 * @type   Piwik.UI.DatePicker
 */
DatePicker.prototype.init = function (params) {

    this.period    = this.getParam('period', this.period);
    this.from      = this.getParam('from', this.from);
    this.to        = this.getParam('to', this.to);
    
    var scrollView = Ti.UI.createScrollView({id: 'datePickerScrollView'});
    
    this.addPeriodPicker(scrollView);
    this.addFromDatePicker(scrollView);
    this.addToDatePicker(scrollView);
    
    var dateDialog = Ti.UI.createOptionDialog({title: _('General_ChooseDate'),
                                               options: null,
                                               androidView: scrollView});
    this.addButtons(dateDialog);
    dateDialog.show();

    params     = null;
    dateDialog = null;
    scrollView = null;
    
    this.setPeriod(this.period);

    return this;
};

/**
 * Sets (overwrites) the period and updates the date picker depending on the given period. For example if 
 * period==range it'll display the 'to date picker' whereas it'll hide the 'to date picker' if period!=range.
 * 
 * @param  {string}  period
 */
DatePicker.prototype.setPeriod = function (period) {
    
    if (!period) {
        
        return;
    }
    
    this.period = period;
    
    if (!this.toDateView || !this.fromLabel) {
        
        return;
    }

    if ('range' == this.period) {
        this.toDateView.show();
        this.fromLabel.text = _('General_DateRangeFrom_js');
    } else {
        this.toDateView.hide();
        this.fromLabel.text = _('General_Date');
    }
};

/**
 * Adds the period selector to the given container. It'll automatically perselect the current period.
 *
 * @param  {Titanium.UI.View}  container  A view where the date selector shall be rendered into.
 */
DatePicker.prototype.addPeriodPicker = function (container) {
    if (!container) {
        
        return;
    }
    
    var periodView   = Ti.UI.createView({className: 'datePickerView'});
    
    periodView.add(Ti.UI.createLabel({text: _('General_Period'), className: 'datePickerLabel'}));

    var periodPicker = Ti.UI.createPicker({id: 'datePickerPeriodPicker'});
    
    var piwikDate    = Piwik.require('PiwikDate');
    var periods      = piwikDate.getAvailablePeriods();
    var period       = null;
    
    var pickerRows   = [];
    for (period in periods) {
        pickerRows.push(Ti.UI.createPickerRow({title: periods[period], period: period}));
    }
    
    periodPicker.add(pickerRows);

    var index = 0;
    for (period in periods) {
        if (this.period == period) {
            periodPicker.setSelectedRow(0, index, false);
            break;
        }
        
        index++;
    }

    var that = this;
    periodPicker.addEventListener('change', function (event) {

        if (!event || !event.row || !event.row.period || !that) {
            
            return;
        }
        
        that.setPeriod(event.row.period);
        event = null;
    });

    periodView.add(periodPicker);
    container.add(periodView);
    
    periodPicker = null;
    pickerRows   = null;
    piwikDate    = null;
    periodView   = null;
    container    = null;
};

/**
 * Adds the 'from' date selector to the given container. It'll automatically preselect the current 'from' date.
 * 
 * @param  {Titanium.UI.View}  container  A view where the 'from' date selector shall be rendered into.
 */
DatePicker.prototype.addFromDatePicker = function (container) {
    if (!container) {
        
        return;
    }
    
    var fromView   = Ti.UI.createView({className: 'datePickerView'});
    
    this.fromLabel = Ti.UI.createLabel({text: _('General_Date'), className: 'datePickerLabel'});
    fromView.add(this.fromLabel);

    var params     = this.getParams();
    params.id      = 'datePickerFromPicker';
    params.value   = this.from;

    var picker     = Ti.UI.createPicker(params);

    var that       = this;
    // the change event is triggered on each date change
    picker.addEventListener('change', function (event) {
        if (!event || !event.value || !that) {
            
            return;
        }
        
        that.from = event.value;
        event     = null;
    });

    fromView.add(picker);
    container.add(fromView);
    
    picker    = null;
    params    = null;
    fromView  = null;
    container = null;
};

/**
 * Adds the 'to' date selector to the given container. It'll automatically preselect the current 'to' date.
 * 
 * @param  {Titanium.UI.View}  container  A view where the 'to' date selector shall be rendered into.
 */
DatePicker.prototype.addToDatePicker = function (container) {
    if (!container) {
        
        return;
    }
    
    this.toDateView = Ti.UI.createView({className: 'datePickerView'});
    
    this.toDateView.add(Ti.UI.createLabel({text: _('General_DateRangeTo_js'), className: 'datePickerLabel'}));
    
    var params   = this.getParams();
    params.id    = 'datePickerToPicker';
    params.value = this.to;
    
    var picker   = Ti.UI.createPicker(params);

    var that     = this;
    picker.addEventListener('change', function (event) {
        if (!event || !event.value || !that) {
            
            return;
        }
        
        that.to = event.value;
        event   = null;
    });

    this.toDateView.add(picker);
    container.add(this.toDateView);
    
    picker    = null;
    params    = null;
    container = null;
};

/**
 * Adds an 'Update' and a 'Cancel' button to the Android Date Dialog.
 *
 * @param  {Titanium.UI.OptionDialog}  dateDialog  An OptionDialog view.
 *
 * @fires  Piwik.UI.DatePicker#event:onSet
 */
DatePicker.prototype.addButtons = function (dateDialog) {
    if (!dateDialog) {
        Piwik.getLog().warn('dateDialog does not exist: ' + Piwik.getPlatform().osName, 
                            'Piwik.UI.DatePicker::addButtons');

        return;
    }

    dateDialog.buttonNames = [_('CoreUpdater_UpdateTitle'), _('SitesManager_Cancel_js')];
    dateDialog.cancel      = 1;
    
    var that = this;
    dateDialog.addEventListener('click', function (event) {
 
        if (event && 0 === event.index) {
            // fire event only if user pressed Update button
            var myEvent = {from: that.from, to: that.to, period: that.period, type: 'onSet'};
            that.fireEvent('onSet', myEvent);
            
            that.cleanup();
            that = null;
            
        } else {
            // user pressed cancel button or hardware back button
            
            that.cleanup();
            that = null;
        }

     });
     
     dateDialog = null;
};

/**
 * Cleanup all references to prevent memory leaks.
 */
DatePicker.prototype.cleanup = function () {

    this.toDateView = null;
    this.fromLabel  = null;
    
    this.from       = null;
    this.to         = null;
    this.period     = null;
};

module.exports = DatePicker;