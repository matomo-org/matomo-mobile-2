function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
}

var args = arguments[0] || {};

// the currently selected account
var accountModel       = args.account || false;
// the currently selected website
var siteModel          = args.site || false;
// A list of all available reports
var reportsCollection  = Alloy.Collections.piwikReports;

var reportModel = args.report || false;

var reportCategory = 'Visits Summary';
if (reportModel) {
    reportCategory = reportModel.get('category');
}

function refresh()
{
    reportsCollection.fetchAllReports(accountModel, siteModel);
}

function doOpenSettings()
{
    var settings = Alloy.createController('settings');
    settings.open();
}

function transformReport(model)
{
    model.accountModel = accountModel;
    model.siteModel    = siteModel;

    return model;
}

function filterReports(collection)
{
    return collection.where({category: reportCategory});
}

function toggleReportMenu(event)
{
    require('layout').toggleMenu();
}

function open()
{
    require('layout').open($.index);
    refresh();
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open = open;