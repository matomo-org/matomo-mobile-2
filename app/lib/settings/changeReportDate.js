/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
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
    
    reportNames.push(L('SitesManager_Cancel_js'));

    return reportNames;
}

function currentSelectedReportDateIndex()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    var availableReportDates = getAvailableDateRanges();
    console.log(availableReportDates);
    console.log(settings.getReportDate());
    console.log(settings.getReportPeriod());
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

function onReportDateChosen(event)
{
    // android reports cancel = true whereas iOS returns the previous defined cancel index
    if (!event || event.cancel === event.index || true === event.cancel) {

        return;
    }

    if (hasUserSelectedSameValueAsAlreadySelected(event.index)) {
        
        return;
    }

    var reportDate = getSelectedReportDateAndPeriodByIndex(event.index);

    if (!reportDate) {
        return;
    }

    var settings = Alloy.createCollection('AppSettings').settings();
    settings.setReportDateAndPeriod(reportDate.period, reportDate.date);

    trackReportDateChange(settings.getReportPeriod(), settings.getReportDate());
}


function trackReportDateChange(period, date)
{
    var tracker = require('Piwik/Tracker');
    tracker.trackEvent({title: 'Default Report Date Change',
                        url: '/settings/change-defaultreportdate/' + period + '/' + date});
}

exports.open = function () 
{
    var options = getAvailableReportDateNames();

    var dialog  = Ti.UI.createOptionDialog({
        title: L('Mobile_DefaultReportDate'),
        options: options,
        cancel: options.length - 1,
    });

console.warn(currentSelectedReportDateIndex()+'');
    dialog.selectedIndex = currentSelectedReportDateIndex();
    dialog.addEventListener('click', onReportDateChosen);

    dialog.show();
    dialog = null;

}