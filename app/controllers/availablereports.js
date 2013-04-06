function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel      = args.account || false;
// the currently selected website
var siteModel         = args.site || false;
var reportsCollection = Alloy.Collections.piwikReports;

reportsCollection.on('fetch', updateAvailableReportsList);

var currentlyActiveReport = null;

function updateAvailableReportsList()
{
    if (!reportsCollection) {
        return;
    }
    
    var rows = [];
    var currentSection = null;
    var latestSection  = null;

    rows.push(Alloy.createController('availablereportsection', {title: L('Mobile_Reports')}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Real-time Map'), cid: 'visitormap'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Live_VisitorsInRealTime'), cid: 'live'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Live_VisitorLog'), cid: 'visitorlog'}).getView());

    reportsCollection.forEach(function (report) 
    {
        currentSection = report.get('category');

        if ('MultiSites' == currentSection || 'API' == currentSection) {
            // we do not display this report
            return;
        }

        if (currentSection && currentSection !== latestSection) {
            rows.push(Alloy.createController('availablereportrow', {title: currentSection, cid: report.cid}).getView());
            latestSection = currentSection;
        }
    });

    $.reportsTable.setData(rows);
    rows = null;
}

function doSelectReport(event) 
{
    if (!event.rowData.cid) {
        return;
    }
    
    var cid = event.rowData.cid;

    require('layout').hideMenu();
    currentlyActiveReport.close();

    if ('live' == cid) {
        onLiveVisitorsChosen();
    } else if ('visitorlog' == cid) {
        onVisitorLogChosen();
    } else if ('visitormap' == cid) {
        onVisitorMapChosen();
    } else {
        var report = reportsCollection.getByCid(cid);
        onReportChosen(report);
    }
}

function onReportChosen(chosenReportModel)
{
    var statistics = Alloy.createController('compositereport', {account: accountModel,
                                                                report: chosenReportModel,
                                                                site: siteModel});
    statistics.open();
    setCurrentlyOpenedReport(statistics);
}

function onLiveVisitorsChosen()
{
    var params = {account: accountModel, site: siteModel};
    var live   = Alloy.createController('livevisitors', params);
    live.open();
    setCurrentlyOpenedReport(live);
}

function onVisitorLogChosen()
{
    var params = {account: accountModel, site: siteModel};
    var log    = Alloy.createController('visitorlog', params);
    log.open();
    setCurrentlyOpenedReport(log);
}

function setCurrentlyOpenedReport(controller)
{
    currentlyActiveReport = controller;
}

function onVisitorMapChosen()
{
    var params      = {account: accountModel, site: siteModel};
    var realtimemap = Alloy.createController('realtime_map', params);
    realtimemap.open();
    setCurrentlyOpenedReport(realtimemap);
}

exports.updateWebsite = function (newSiteModel) {
    siteModel = newSiteModel
}

exports.open = function() 
{
    require('layout').setMenuView($.reportsTable);

    var statistics = Alloy.createController('compositereport', {account: accountModel,
                                                                site: siteModel});
    statistics.open();
    setCurrentlyOpenedReport(statistics);
};