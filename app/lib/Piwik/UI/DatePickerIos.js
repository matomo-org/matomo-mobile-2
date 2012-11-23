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
 *            The picker will be opened within a modal window. The user has the possiblity to change the date or
 *            to cancel the whole process. If the selected period is range, the user has the possibility to set two
 *            dates. From and to. Otherwise the user is just able to set the 'from' date. Depending on the selected
 *            row within the tableview it'll show/hide the correct picker. Only one picker is displayed, all other 
 *            pickers are hidden until the user selects another picker within the tabelview.
 * 
 * @see       <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.Picker-object">Titanium.UI.Picker</a>
 *
 * @exports   DatePicker as Piwik.UI.DatePickerIos
 * @augments  Piwik.UI.View 
 */
function DatePicker () {

    /**
     * This event will be fired as soon as the user confirms the selected/changed date. It is not triggered on
     * each change.
     *
     * @name   Piwik.UI.DatePickerIos#event:onSet
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
    this.from   = new Date();
    
    /**
     * The currently selected 'to' date. 
     *
     * @type  Date
     */
    this.to     = new Date();

    /**
     * The currently selected period.
     *
     * @defaults  "day"
     *
     * @type      string
     */
    this.period = 'day';

    /**
     * An instance of the modal window. The date picker is displayed within this window.
     *
     * @type  null|Piwik.UI.ModalWindow
     */
    this.win          = null;

    /**
     * An instance of the table view. The user has the possibility to switch between each picker in this tableview.
     *
     * @type  null|Ti.UI.TableView
     */
    this.tableView    = null;
    
    /**
     * An instance of the period picker.
     *
     * @type  null|Ti.UI.Picker
     */
    this.periodPicker = null;
    
    /**
     * An instance of the from date picker.
     *
     * @type  null|Ti.UI.Picker
     */
    this.fromPicker   = null;
    
    /**
     * An instance of the to date picker.
     *
     * @type  null|Ti.UI.Picker
     */
    this.toPicker     = null;
    
    /**
     * An instance of the period row. Once the user selects this row it'll show the period picker.
     *
     * @type  null|Piwik.UI.TableViewRow
     */
    this.periodRow    = null;
        
    /**
     * An instance of the 'from' date row. Once the user selects this row it'll show the 'from date' picker.
     *
     * @type  null|Piwik.UI.TableViewRow
     */
    this.fromDateRow  = null;
        
    /**
     * An instance of the 'to' date row. Once the user selects this row it'll show the 'to date' picker.
     *
     * @type  null|Piwik.UI.TableViewRow
     */
    this.toDateRow    = null;
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
 * @type   Piwik.UI.DatePickerIos
 */
DatePicker.prototype.init = function (params) {

    if (!params) {
        params = {};
    }
    
    this.period = this.getParam('period', this.period);
    this.from   = this.getParam('from', this.from);
    this.to     = this.getParam('to', this.to);

    this.win    = this.create('ModalWindow', {title: _('General_ChooseDate'), 
                                              openView: params.source ? params.source : null});

    var that    = this;
    this.win.addEventListener('close', function () {
        if (!that || !that.cleanup) {
            
            return;
        }
        
        if (that.win && that.win.cleanup) {
            that.win.cleanup();
        }
        
        that.cleanup();
        that = null;
    });
    
    this.win.open();

    this.createPickerChooser();
    this.selectRow(1);
    this.setPeriod(this.period);
    
    this.createDoneButton();
    this.createFromDatePicker(params);

    this.tableView.updateLayout({bottom: this.fromPicker.size.height});

    this.createPeriodPicker();
    this.createToDatePicker(params);

    params = null;

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
    
    if (!this.tableView || !this.fromDateRow) {
        
        return;
    }
    
    if ('range' == this.period) {
        this.fromDateRow.changeTitle(_('General_DateRangeFrom_js'));
        this.tableView.setData([this.periodRow, this.fromDateRow, this.toDateRow]);
    } else {
        this.fromDateRow.changeTitle(_('General_Date'));
        this.tableView.setData([this.periodRow, this.fromDateRow]);
    }
};

/**
 * Selects the row with the given index within the picker chooser tableview.
 *
 * @param  {number}  index  The index of the row which should be selected.
 */
DatePicker.prototype.selectRow = function (index) {
    // yes, I know... there exists a tableView.selectRow() method which does exactly the same but native.
    // but this method is ... everytime the tableView renders again the selected row is no longer selected. Also, cause
    // the re-render process is async a selectRow() does not always work. Too make it short: It's not a good idea to use
    // this. At least at the moment.
    
    if (!this.fromDateRow || !this.periodRow || !this.periodRow) {
        
        return;
    }
    
    if (0 === index) {
        this.fromDateRow.backgroundColor = '#ffffff';
        this.toDateRow.backgroundColor   = '#ffffff';
        this.periodRow.backgroundColor   = '#bbbbbb';
    } else if (2 == index) {
        this.fromDateRow.backgroundColor = '#ffffff';
        this.toDateRow.backgroundColor   = '#bbbbbb';
        this.periodRow.backgroundColor   = '#ffffff';
    } else if (1 == index) {
        this.fromDateRow.backgroundColor = '#bbbbbb';
        this.toDateRow.backgroundColor   = '#ffffff';
        this.periodRow.backgroundColor   = '#ffffff';
    }
};

/**
 * Creates the picker chooser. The user has the possiblity to choose which picker shall be displayed (period picker, 
 * from picker or to picker). Therefore it creates a tableview and three rows. One row for each picker. Beside the name 
 * of each picker the rows are also displaying the current value. For example the current selected period or 
 * date.
 */
DatePicker.prototype.createPickerChooser = function () {
    
    if (!this.win) {
        
        return;
    }
    
    this.periodRow   = this.create('TableViewRow', {title: _('General_Period'),
                                                    className: 'datePickerPeriodTableViewRow',
                                                    value: _('General_Period')});
    this.fromDateRow = this.create('TableViewRow', {title: _('General_Date'),
                                                    className: 'datePickerFromTableViewRow',
                                                    value: this.getDisplayDate(this.from)});
    this.toDateRow   = this.create('TableViewRow', {title: _('General_DateRangeTo_js'),
                                                    className: 'datePickerToTableViewRow',
                                                    value: this.getDisplayDate(this.to)});

    this.tableView   = this.create('TableView', {id: 'datePickerChooserTableView'});
    
    this.win.add(this.tableView.get());
    
    var that = this;
    this.tableView.addEventListener('click', function (event) {
        
        if (!that || !that.toPicker || !that.fromPicker || !that.periodPicker || !that.tableView) {
            
            return;
        }
        
        that.selectRow(event.index);
        
        if (0 === event.index) {
            
            that.toPicker.hide();
            that.fromPicker.hide();
            that.periodPicker.show();

            // workaround for iPhone landscape orientation. Otherwise the tableview is not fully visible/scrollable
            that.tableView.updateLayout({bottom: that.periodPicker.size.height});

        } else if (1 == event.index) {
            
            that.toPicker.hide();
            that.periodPicker.hide();
            that.fromPicker.show();
            
            that.tableView.updateLayout({bottom: that.fromPicker.size.height});
            
        } else if (2 == event.index) {
            
            that.periodPicker.hide();
            that.fromPicker.hide();
            that.toPicker.show();
            
            that.tableView.updateLayout({bottom: that.toPicker.size.height});
        }
        
    });
};

/**
 * Creates the period picker and adds it to the window. The user has the possibility to choose between each available 
 * period. It'll automatically perselect the current period.
 */
DatePicker.prototype.createPeriodPicker = function () {
        
    if (!this.win) {
        
        return;
    }
    
    var piwikDate  = Piwik.require('PiwikDate');
    var periods    = piwikDate.getAvailablePeriods();
    
    var pickerRows = [];
    var period     = null;
    
    for (period in periods) {
        pickerRows.push({title: periods[period], period: period});
    }

    this.periodPicker = Ti.UI.createPicker({id: 'datePickerPeriod', selectionIndicator: true});
    
    this.periodPicker.add(pickerRows);
    this.win.add(this.periodPicker);
    
    var index = 0;
    for (period in periods) {
        if (this.period == period) {
            this.periodPicker.setSelectedRow(0, index, true);
            this.periodRow.changeValue(periods[period]);
            break;
        }
        
        index++;
    }
    
    this.periodPicker.hide();
    
    var that = this;
    this.periodPicker.addEventListener('change', function (event) {
        if (!that || !event || !event.row || !that.periodRow) {
            
            return;
        }
        
        that.periodRow.changeValue(event.row.title);
        that.setPeriod(event.row.period);
        
        event = null;
    });

    for (var rowIndex = 0; rowIndex < pickerRows.length; rowIndex++) {
        pickerRows[rowIndex] = null;
    }
    
    pickerRows = null;
    periods    = null;
    piwikDate  = null;
};

/**
 * Creates the 'from' date picker and adds it to the window. It'll automatically preselect the current 'from' date.
 */
DatePicker.prototype.createFromDatePicker = function (params) {
    
    if (!this.win || !params) {
        
        return;
    }
    
    params.id       = 'datePickerFrom';
    params.value    = this.from;
    
    this.fromPicker = Ti.UI.createPicker(params);
    params          = null;
    
    this.win.add(this.fromPicker);

    var that = this;
    this.fromPicker.addEventListener('change', function (event) {
                
        if (!event || !that) {
            
            return;
        }
        
        that.from       = event.value;
        var displayDate = that.getDisplayDate(event.value);
        event           = null;
        
        if (!that.fromDateRow) {
            
            return;
        }
        
        that.fromDateRow.changeValue(displayDate);
    });
};

/**
 * Creates the 'to' date picker and adds it to the window. It'll automatically preselect the current 'to' date.
 */
DatePicker.prototype.createToDatePicker = function (params) {
    
    if (!this.win || !params) {
        
        return;
    }
    
    params.id      = 'datePickerTo';
    params.visible = false;
    params.value   = this.to;
    
    this.toPicker  = Ti.UI.createPicker(params);
    params         = null;

    this.win.add(this.toPicker);
    
    var that = this;
    this.toPicker.addEventListener('change', function (event) {
        
        if (!event || !that) {
            
            return;
        }
        
        that.to         = event.value;
        var displayDate = that.getDisplayDate(event.value);
        event           = null;
        
        if (!that.toDateRow) {
            
            return;
        }
        
        that.toDateRow.changeValue(displayDate);
    });
};

/**
 * Adds a 'Done' button to the modal window. If the user presses this button, it'll fire the 'onSet' event and close
 * the modal window.
 *
 * @fires  Piwik.UI.DatePickerIos#event:onSet
 */
DatePicker.prototype.createDoneButton = function () {
    
    if (!this.win) {
        
        return;
    }

    var that       = this;
    var doneButton = Ti.UI.createButton({title: _('General_Done'),
                                         style: Ti.UI.iPhone.SystemButtonStyle.DONE});

    doneButton.addEventListener('click', function () {

        try {
            
            var myEvent = {from: that.from, to: that.to, period: that.period, type: 'onSet'};
            that.fireEvent('onSet', myEvent);
            
            that.win.close();
            
            myEvent  = null;
            that     = null;
            
        } catch (e) {
            Piwik.getLog().warn('Failed to close site chooser window', 'Piwik.UI.Menu::onChooseSite');
        }
    });

    this.win.setRightNavButton(doneButton);
    doneButton = null;
};

/**
 * Cleanup all references to prevent memory leaks.
 */
DatePicker.prototype.cleanup = function () {
    
    if (this.tableView) {
        this.tableView.cleanup();
    }
    
    // fromDateRow and periodDateRow will be cleaned up by the cleanup method above. We have to make sure that the 
    // toDataRow will be cleaned up also.
    if (this.toDateRow && this.toDateRow.cleanup) {
        this.toDateRow.cleanup();
    }
    
    this.fromDateRow  = null;
    this.toDateRow    = null;
    this.periodRow    = null;
    /*
    if (this.win && this.win.remove && this.tableView) {
        this.win.remove(this.tableView);
    }
    */
    if (this.win && this.win.remove && this.periodPicker) {
        this.win.remove(this.periodPicker);
    }
    
    if (this.win && this.win.remove && this.fromPicker) {
        this.win.remove(this.fromPicker);
    }
    
    if (this.win && this.win.remove && this.toPicker) {
        this.win.remove(this.toPicker);
    }
    
    this.win          = null;
    this.tableView    = null;
    
    this.periodPicker = null;
    this.fromPicker   = null;
    this.toPicker     = null;
    
    this.from         = null;
    this.to           = null;
    this.period       = null;
};

/**
 * Converts the given date to a human readable date format.
 * 
 * @param  {Date}  selectedDate
 * 
 * @type   string
 */
DatePicker.prototype.getDisplayDate = function (selectedDate) {
    
    if (!selectedDate) {
        
        return '';
    }
    
    return selectedDate.toLocaleDateString();
};

module.exports = DatePicker;