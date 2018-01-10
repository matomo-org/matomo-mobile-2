/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var L     = require('L');
var Alloy = require('alloy');

function getAvailableDateRanges()
{
    var piwikDate = new (require('report/date'));
    var availableDateRanges = piwikDate.getAvailableDateRanges();

    return availableDateRanges;
}

function getAvailableReportDateNames()
{
    var availableReportDates = getAvailableDateRanges();

    var reportNames = [];
    for (var index in availableReportDates) {
        reportNames.push(availableReportDates[index].label);
    }

    return reportNames;
}

function currentSelectedReportDateIndex()
{
    var settings = getSettings();

    var availableReportDates = getAvailableDateRanges();

    for (var index in availableReportDates) {
        
        if (availableReportDates[index] &&
            availableReportDates[index].period == settings.getReportPeriod() &&
            availableReportDates[index].date == settings.getReportDate()) {

            return index;
        }
    }
}

function hasUserSelectedSameValueAsAlreadySelected(selectedIndex)
{
    return (selectedIndex == currentSelectedReportDateIndex());
}

function getSelectedReportDateAndPeriodByIndex(index)
{
    var availableReportDates = getAvailableDateRanges();

    if (availableReportDates[index]) {

        return availableReportDates[index];
    }
}

function getSettings()
{
    return Alloy.createCollection('AppSettings').settings();
}

function onReportDateChosen(event)
{
    // android reports cancel = true whereas iOS returns the previous defined cancel index
    if (!event || event.cancel === event.index || true === event.cancel || event.button) {

        return;
    }

    if (hasUserSelectedSameValueAsAlreadySelected(event.index)) {
        
        return;
    }

    var reportDate = getSelectedReportDateAndPeriodByIndex(event.index);

    if (!reportDate) {
        return;
    }

    var settings = getSettings();
    settings.setReportDateAndPeriod(reportDate.period, reportDate.date);
    settings.save();

    trackReportDateChange(settings.getReportPeriod(), settings.getReportDate());
}

function trackReportDateChange(period, date)
{
    var tracker = require('Piwik/Tracker');
    tracker.setCustomVariable(1, 'period', period, 'event');
    tracker.setCustomVariable(2, 'date', date, 'event');
    tracker.trackEvent({name: 'Default Report Date Changed', action: 'result', category: 'Settings'});
}

exports.getCurrentReportDate = function () {
    var selectedReportDate = currentSelectedReportDateIndex();
    var reportDate = getSelectedReportDateAndPeriodByIndex(selectedReportDate);

    if (reportDate && reportDate.label) {
        return reportDate.label;
    }

    return '';
};

exports.open = function () 
{
    var options = getAvailableReportDateNames();

    var params = {
        title: L('Mobile_DefaultReportDate'),
        options: options
    };

    if (OS_ANDROID) {
        params.buttonNames = [L('General_Cancel')];
    } else {
        options.push(L('General_Cancel'));
        params.cancel = (options.length - 1);
    }

    var dialog = Ti.UI.createOptionDialog(params);
    dialog.selectedIndex = currentSelectedReportDateIndex();
    dialog.addEventListener('click', onReportDateChosen);

    dialog.show();
    dialog = null;
};