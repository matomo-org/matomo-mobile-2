function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// a list of all available accounts
var fromDate = args.from || new Date();
var toDate = args.to || new Date();
var period = args.period || 'day';

var periodRow   = null;
var fromDateRow = null;
var toDateRow   = null;

var fromPicker   = null;
var toPicker     = null;
var periodPicker = null;

function createRow(params)
{
    return Alloy.createWidget('org.piwik.tableviewrow', null, params).create();
}

function doSelectPicker (event)
{
    if (!toPicker || !fromPicker || !periodPicker) {
        
        return;
    }
    
    selectRow(event.index);
    
    if (0 === event.index) {
        
        toPicker.hide();
        fromPicker.hide();
        periodPicker.show();

        // workaround for iPhone landscape orientation. Otherwise the tableview is not fully visible/scrollable
        $.datePickerTable.applyProperties({bottom: periodPicker.size.height});

    } else if (1 == event.index) {
        
        toPicker.hide();
        periodPicker.hide();
        fromPicker.show();
        
        $.datePickerTable.applyProperties({bottom: fromPicker.size.height});
        
    } else if (2 == event.index) {
        
        periodPicker.hide();
        fromPicker.hide();
        toPicker.show();
        
        $.datePickerTable.applyProperties({bottom: toPicker.size.height});
    }
}

function createTableViewRows ()
{
    periodRow   = createRow({title: L('General_Period'),
                             value: L('General_Period')});
    fromDateRow = createRow({title: L('General_Date'),
                             value: getDisplayDate(fromDate)});
    toDateRow   = createRow({title: L('General_DateRangeTo_js'),
                             value: getDisplayDate(toDate)});
}

function setPeriod (period) 
{
    if (!period) {
        
        return;
    }

    if ('range' == period) {
        fromDateRow.changeTitle(L('General_DateRangeFrom_js'));
        $.datePickerTable.setData([periodRow.getView(), fromDateRow.getView(), toDateRow.getView()]);
    } else {
        fromDateRow.changeTitle(L('General_Date'));
        $.datePickerTable.setData([periodRow.getView(), fromDateRow.getView()]);
    }
};

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

    periodPicker = Ti.UI.createPicker({
        id: 'datePickerPeriod', 
        selectionIndicator: true, 
        bottom: 0,
        zIndex: 101
    });
    
    periodPicker.add(pickerRows);
    $.index.add(periodPicker);
    
    var index = 0;
    for (findPeriod in periods) {
        if (period == findPeriod) {
            periodPicker.setSelectedRow(0, index, true);
            periodRow.changeValue(periods[findPeriod]);
            break;
        }
        
        index++;
    }
    
    periodPicker.hide();
    
    periodPicker.addEventListener('change', onPeriodChange);

    for (var rowIndex = 0; rowIndex < pickerRows.length; rowIndex++) {
        pickerRows[rowIndex] = null;
    }
    
    pickerRows = null;
    periods    = null;
    piwikDate  = null;
};

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
    
    params.id     = 'datePickerFrom';
    params.value  = fromDate;
    params.bottom = 0;
    params.zIndex = 103;
    params.type   = Ti.UI.PICKER_TYPE_DATE;
    
    fromPicker = Ti.UI.createPicker(params);
    params     = null;
    
    $.index.add(fromPicker);

    fromPicker.addEventListener('change', onFromDateChange);
};

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
    if (!$.index || !params) {
        
        return;
    }
    
    params.id      = 'datePickerTo';
    params.visible = false;
    params.value   = toDate;
    params.bottom  = 0;
    params.zIndex  = 102;
    params.type    = Ti.UI.PICKER_TYPE_DATE;
    
    toPicker = Ti.UI.createPicker(params);
    params   = null;

    $.index.add(toPicker);
    
    toPicker.addEventListener('change', onToDateChange);
};

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
};

function closeWindow ()
{
    require('layout').close($.index);
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
    setPeriod(period);
    selectRow(1);
    createFromDatePicker(args);

    $.datePickerTable.applyProperties({bottom: fromPicker.size.height});

    createToDatePicker(args);
    createPeriodPicker(args);

    require('layout').open($.index);
}