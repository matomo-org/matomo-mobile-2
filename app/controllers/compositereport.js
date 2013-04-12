function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var reportCategory    = args.reportCategory;
var reportsCollection = Alloy.Collections.piwikReports;
var reportDate        = require('session').getReportDate();

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', onWebsiteChosen);
    session.on('reportDateChanged', onDateChosen);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', onWebsiteChosen);
    session.off('reportDateChanged', onDateChosen);
}

function onClose()
{
    unregisterEvents();

    $.destroy();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

var accountModel = require('session').getAccount();

function accountDidNotChange()
{
    var currentAccount = require('session').getAccount();

    return currentAccount === accountModel;
}

function onWebsiteChosen()
{
    if (accountDidNotChange()) {
        forceRenderingListOfReports();
    } else {
        // let reportChooser to the refresh
    }
}

function onDateChosen() 
{
    if (accountDidNotChange()) {
        forceRenderingListOfReports();
    } else {
        // let reportChooser to the refresh
    }
}

function filterReports(collection)
{
    // TODO this will not work!
    $.index.title = reportCategory;
    
    return collection.where({category: reportCategory});
}

function isDataAlreadyFetched()
{
    return reportsCollection.length;
}

function forceRenderingListOfReports()
{
    reportsCollection.trigger('change');
}

function preventListOfReportsWillBeRenderedTwice()
{
    // TODO currently fetch and reset are triggered... causes list is rendered (and data fetched) twice!
    reportsCollection.off("reset");
}

function open()
{
    require('layout').open($.index);

    if (isDataAlreadyFetched()) {
        forceRenderingListOfReports();
    }

    preventListOfReportsWillBeRenderedTwice();

    registerEvents();
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open  = open;