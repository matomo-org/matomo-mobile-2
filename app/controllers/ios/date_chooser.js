/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

var fromDate = args.from || new Date();
var toDate   = args.to || new Date();
var period   = args.period || 'day';
var popoverSource = args.source || null;

var periodRow   = null;
var fromDateRow = null;
var toDateRow   = null;

function trackWindowRequest()
{
    require('Piwik/Tracker').setCustomVariable(1, 'period', period, 'page');
    
    require('Piwik/Tracker').trackWindow('Date Chooser', 'date-chooser');
}

function onOpen()
{
    trackWindowRequest();
}

function createRow(params)
{
    params.selectable = true;

    return Alloy.createWidget('org.piwik.tableviewrow', null, params).create();
}

function doSelectPicker (event)
{
    if (!$.toPicker || !$.fromPicker || !$.iOSPeriodPicker || !event) {
        
        return;
    }
    
    selectRow(event.index);
    
    if (0 === event.index) {
        
        $.toPicker.hide();
        $.fromPicker.hide();
        $.iOSPeriodPicker.show();

        // workaround for iPhone landscape orientation. Otherwise the tableview is not fully visible/scrollable
        $.datePickerTable.applyProperties({bottom: $.iOSPeriodPicker.size.height});

    } else if (1 == event.index) {
        
        $.toPicker.hide();
        $.iOSPeriodPicker.hide();
        $.fromPicker.show();
        
        $.datePickerTable.applyProperties({bottom: $.fromPicker.size.height});
        
    } else if (2 == event.index) {
        
        $.iOSPeriodPicker.hide();
        $.fromPicker.hide();
        $.toPicker.show();
        
        $.datePickerTable.applyProperties({bottom: $.toPicker.size.height});
    }
}

function createTableViewRows ()
{
    periodRow   = createRow({title: L('General_Period'),
                             value: L('General_Period')});
    fromDateRow = createRow({title: L('General_Date'),
                             value: getDisplayDate(fromDate)});
    toDateRow   = createRow({title: L('General_DateRangeTo'),
                             value: getDisplayDate(toDate)});
}

function setPeriod (periodToSet) 
{
    if (!periodToSet || !fromDateRow || !periodRow || !toDateRow) {
        
        return;
    }

    period = periodToSet;

    if ('range' == period) {
        fromDateRow.changeTitle(L('General_DateRangeFrom'));
        $.datePickerTable.setData([periodRow.getView(), fromDateRow.getView(), toDateRow.getView()]);
    } else {
        fromDateRow.changeTitle(L('General_Date'));
        $.datePickerTable.setData([periodRow.getView(), fromDateRow.getView()]);
    }
}

function onPeriodChange(event)
{
    if (!event || !event.row || !periodRow) {
        
        return;
    }
    
    periodRow.changeValue(event.row.title);
    setPeriod(event.row.period);
    
    event = null;
}

function createPeriodPicker () 
{
    var piwikDate  = new (require('report/date'));
    var periods    = piwikDate.getAvailablePeriods();
    
    var pickerRows = [];
    var findPeriod = null;
    
    for (findPeriod in periods) {
        pickerRows.push({title: periods[findPeriod], period: findPeriod});
    }

    $.iOSPeriodPicker.bottom = 0;

    $.iOSPeriodPicker.add(pickerRows);
    
    var index = 0;
    for (findPeriod in periods) {
        if (period == findPeriod) {
            $.iOSPeriodPicker.setSelectedRow(0, index, true);
            periodRow.changeValue(periods[findPeriod]);
            break;
        }
        
        index++;
    }
    
    $.iOSPeriodPicker.hide();
   
    for (var rowIndex = 0; rowIndex < pickerRows.length; rowIndex++) {
        pickerRows[rowIndex] = null;
    }
    
    pickerRows = null;
    periods    = null;
    piwikDate  = null;
}

function onFromDateChange(event)
{
    if (!event) {
        
        return;
    }
    
    fromDate        = event.value;
    var displayDate = getDisplayDate(event.value);
    event           = null;
    
    if (!fromDateRow) {
        
        return;
    }
    
    fromDateRow.changeValue(displayDate);
}

function createFromDatePicker (params) 
{
    if (!params) {
        
        return;
    }

    $.fromPicker.applyProperties({
        value: fromDate, 
        bottom: 0, 
        minDate: params.minDate, 
        maxDate: params.maxDate
    });

    $.fromPicker.show();
}

function onToDateChange(event)
{
    if (!event) {
        
        return;
    }
    
    toDate          = event.value;
    var displayDate = getDisplayDate(event.value);
    event           = null;
    
    if (!toDateRow) {
        
        return;
    }
    
    toDateRow.changeValue(displayDate);
}

function createToDatePicker (params)
{
    if (!params) {
        
        return;
    }

    $.toPicker.applyProperties({
        value: toDate, 
        bottom: 0, 
        minDate: params.minDate, 
        maxDate: params.maxDate
    });
}

function selectRow (index) 
{
    // yes, I know... there exists a tableView.selectRow() method which does exactly the same but native.
    // but this method is ... everytime the tableView renders again the selected row is no longer selected. Also, cause
    // the re-render process is async a selectRow() does not always work. Too make it short: It's not a good idea to use
    // this. At least at the moment.
    
    if (!fromDateRow || !toDateRow || !periodRow) {
        
        return;
    }
    
    if (0 === index) {
        fromDateRow.getView().backgroundColor = '#ffffff';
        toDateRow.getView().backgroundColor   = '#ffffff';
        periodRow.getView().backgroundColor   = '#bbbbbb';
    } else if (2 == index) {
        fromDateRow.getView().backgroundColor = '#ffffff';
        toDateRow.getView().backgroundColor   = '#bbbbbb';
        periodRow.getView().backgroundColor   = '#ffffff';
    } else if (1 == index) {
        fromDateRow.getView().backgroundColor = '#bbbbbb';
        toDateRow.getView().backgroundColor   = '#ffffff';
        periodRow.getView().backgroundColor   = '#ffffff';
    }
}
function getDisplayDate (selectedDate) 
{
    if (!selectedDate) {
        
        return '';
    }
    
    return selectedDate.toLocaleDateString();
}

function closeWindow ()
{
    if (Alloy.isTablet) {
        $.index.hide();
    } else {
        $.index.close();
    }

    $.destroy();
    $.off();
}

function doChooseDate () 
{
    try {

        var myEvent = {from: fromDate, to: toDate, period: period, type: 'onSet'};
        $.trigger('onSet', myEvent);
        
        closeWindow();
        
    } catch (e) {
        console.warn('Failed to close site chooser window', 'datechooser::dochoosedate', e);
    }
}

exports.open = function ()
{
    createTableViewRows();
    createPeriodPicker(args);

    if (Alloy.isTablet) {
        $.index.show({view: popoverSource});
    } else {
        $.index.open({modal: true});
    }

    setPeriod(period);
    selectRow(1);
    createFromDatePicker(args);

    $.datePickerTable.applyProperties({bottom: $.fromPicker.size.height});

    createToDatePicker(args);
};