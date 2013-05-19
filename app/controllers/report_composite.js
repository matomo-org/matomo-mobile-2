/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var reportCategory    = args.reportCategory || null;
var reportsCollection = Alloy.Collections.piwikReports;
var reportDate        = require('session').getReportDate();

function registerEvents()
{
    Alloy.Collections.piwikReports.on('reset', hideLoadingIndicator);

    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
}

function unregisterEvents()
{
    Alloy.Collections.piwikReports.off('reset', hideLoadingIndicator);
    
    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);
}

function trackWindowRequest()
{
    var category = reportCategory ? reportCategory : ''
    require('Piwik/Tracker').setCustomVariable(1, 'reportCategory', category, 'page');

    require('Piwik/Tracker').trackWindow('Composite Report', 'report/composite');
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    unregisterEvents();

    $.destroy();
}

function hideLoadingIndicator()
{
    $.loadingIndicator.hide();
}

function showLoadingIndicator()
{
    $.loadingIndicator.show();
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/composite/toggle/report-configurator'});
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/report/composite/toggle/report-chooser'});
}

var accountModel = require('session').getAccount();

function accountDidNotChange()
{
    var currentAccount = require('session').getAccount();

    return currentAccount === accountModel;
}

function onWebsiteChanged()
{
    if (accountDidNotChange()) {
        renderListOfReports();
    } else {
        // let reportChooser to the refresh
    }

    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/composite/change/website'});
}

function onDateChanged() 
{
    if (accountDidNotChange()) {
        renderListOfReports();
    } else {
        // let reportChooser to the refresh
    }

    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/composite/change/date'});
}

function filterReports(collection)
{
    if (!reportCategory) {
        var entryReport = collection.getEntryReport();

        if (!entryReport) {
            return collection;
        }
        
        reportCategory  = entryReport.get('category');
    }

    $.index.title = reportCategory;

    return collection.where({category: reportCategory});
}

function isDataAlreadyFetched()
{
    return !!reportsCollection.length;
}

function open()
{
    registerEvents();
    require('layout').open($.index);

    if (isDataAlreadyFetched()) {
        hideLoadingIndicator();
        renderListOfReports();
    } else {
        showLoadingIndicator();
    }
}


function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open  = open;