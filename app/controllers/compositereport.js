function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var reportCategory    = args.reportCategory;
var reportsCollection = Alloy.Collections.piwikReports;

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', onWebsiteChosen);
    session.on('dateChosen', onDateChosen);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', onWebsiteChosen);
    session.off('dateChosen', onDateChosen);
}

function onClose()
{
    unregisterEvents();

    $.destroy();
}

function toggleReportConfiguratorVisibility()
{
    var siteModel = require('session').getWebsite();

    var reportConfigurator = require('report/configurator');
    reportConfigurator.refresh({websiteName: siteModel.getName(),
                                prettyDate: 'Today'});
    reportConfigurator.toggleVisibility();
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

function onWebsiteChosen()
{
    alert('website chosen');
}

function onDateChosen() 
{
    alert('date chosen');
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