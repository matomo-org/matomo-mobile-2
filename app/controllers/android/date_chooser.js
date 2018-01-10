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

var args   = arguments[0] || {};
var period = args.period || 'day';

function trackWindowRequest()
{
    require('Piwik/Tracker').setCustomVariable(1, 'period', period, 'page');
    
    require('Piwik/Tracker').trackWindow('Date Chooser', 'date-chooser');
}

function close()
{
    $.destroy();
    $.off();
}

function setPeriod(selectedPeriod) {
    
    if (!selectedPeriod) {
        
        return;
    }
    
    period = selectedPeriod;
    
    if (!$.toDateContainer || !$.fromDateHeadline) {
        
        return;
    }

    if ('range' == period) {
        $.toDateContainer.show();
        $.fromDateHeadline.text = L('General_DateRangeFrom');
        $.toDateHeadline.text   = L('General_DateRangeTo');
    } else {
        $.toDateContainer.hide();
        $.fromDateHeadline.text = L('General_Date');
    }
}

function onPeriodChange(event)
{
    if (!event || !event.row || !event.row.period) {
        
        return;
    }
    
    setPeriod(event.row.period);
}

function doChooseDate () 
{
    try {
        var fromDate = $.fromDatePicker.value;
        var toDate   = $.toDatePicker.value;

        var myEvent = {from: fromDate, to: toDate, period: period, type: 'onSet'};
        $.trigger('onSet', myEvent);

        close();
        
    } catch (e) {
        console.warn('Failed to close site chooser window', 'datechooser::dochoosedate', e);
    }
}

function preSelectPeriod(initialPeriod)
{
    var PiwikDates = require('report/date');
    var piwikDate  = new PiwikDates();
    var periods    = piwikDate.getAvailablePeriods();

    if (!$.periodPicker) {
        return;
    }

    var index = 0;
    for (var period in periods) {
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
    var params   = _.clone(_.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model'));
    params.value = args.from || new Date();
    $.fromDatePicker.applyProperties(params);
}

function initToDatePicker()
{
    var params   = _.clone(_.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model'));
    params.value = args.to || new Date();
    $.toDatePicker.applyProperties(params);
}

exports.open = function ()
{
    var dialog = Ti.UI.createOptionDialog({
        title: L('General_ChooseDate'),
        androidView: $.index,
        options: null,
        buttonNames: [L('CoreUpdater_UpdateTitle'), L('General_Cancel')],
        cancel: 1
    });

    dialog.addEventListener('click', function (event) {
        if (event && 0 === event.index) {
            doChooseDate();
        }
    });

    preSelectPeriod(period);
    initFromDatePicker();
    initToDatePicker();

    dialog.show();
    dialog = null;
    
    setPeriod(period);
    trackWindowRequest();
};
