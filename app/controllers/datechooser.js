function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// a list of all available accounts
var fromDate = args.from || new Date();
var toDate = args.to || new Date();
var period = args.period || 'day';


function setPeriod(selectedPeriod) {
    
    if (!selectedPeriod) {
        
        return;
    }
    
    period = selectedPeriod;
    
    if (!$.toDateContainer || !$.fromDateLabel) {
        
        return;
    }

    if ('range' == period) {
        $.toDateContainer.show();
        $.fromDateLabel.text = L('General_DateRangeFrom_js');
        $.toDateLabel.text = L('General_DateRangeTo_js');
    } else {
        $.toDateContainer.hide();
        $.fromDateLabel.text = L('General_Date');
    }
};

function onPeriodChange(event)
{
    if (!event || !event.row || !event.row.period) {
        
        return;
    }
    
    setPeriod(event.row.period);
}

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

function doChangeFromDate() 
{
    if (!event || !event.value) {
        
        return;
    }
    
    fromDate = event.value;
}

function doChangeToDate() 
{
    if (!event || !event.value) {
        
        return;
    }
    
    toDate = event.value;
}

function preSelectPeriod(initialPeriod)
{
    var PiwikDates = require('Piwik/PiwikDate');
    var piwikDate  = new PiwikDates();
    var periods    = piwikDate.getAvailablePeriods();

    var index = 0;
    for (period in periods) {
        if (period == initialPeriod) {
            $.periodPicker.setSelectedRow(0, index, false);
            return;
        }
        
        index++;
    }

    $.periodPicker.setSelectedRow(0, 0, false);
}

function initFromDatePicker()
{
    var params   = JSON.parse(JSON.stringify(args));
    params.value = fromDate;
    $.fromDatePicker.applyProperties(params);
}

function initToDatePicker()
{
    var params   = JSON.parse(JSON.stringify(args));
    params.value = toDate;
    $.toDatePicker.applyProperties(params);
}

exports.open = function ()
{
    preSelectPeriod(period);
    setPeriod(period);
    initFromDatePicker();
    initToDatePicker();

    require('layout').open($.index);
}
