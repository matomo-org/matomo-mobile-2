function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

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

    rows.push(Alloy.createController('availablereportsection', {title: L('General_Reports')}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Real-time Map'), cid: 'visitormap'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Live_VisitorsInRealTime'), cid: 'live'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Live_VisitorLog'), cid: 'visitorlog'}).getView());

    reportsCollection.forEach(function (report) 
    {
        currentSection = report.get('category');

        if ('MultiSites' == report.get('module') || 'API' == report.get('module')) {
            // we do not display this report
            return;
        }

        if (currentSection && currentSection !== latestSection) {
            rows.push(Alloy.createController('availablereportrow', {title: currentSection, cid: report.cid}).getView());
            latestSection = currentSection;
        }
    });

    rows.push(Alloy.createController('availablereportsection', {title: L('Mobile_Account')}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Mobile_Accounts'), cid: 'accounts'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('General_Settings'), cid: 'settings'}).getView());

    $.reportsTable.setData(rows);
    rows = null;
}

function closeCurrentlyOpenedReport()
{
    if (currentlyActiveReport) {
        currentlyActiveReport.close();
    }
}

function doSelectReport(event) 
{
    if (!event.rowData.cid) {
        return;
    }
    
    var cid = event.rowData.cid;

    require('layout').hideLeftSidebar();

    closeCurrentlyOpenedReport();

    if ('live' == cid) {
        onLiveVisitorsChosen();
    } else if ('visitorlog' == cid) {
        onVisitorLogChosen();
    } else if ('visitormap' == cid) {
        onVisitorMapChosen();
    } else if ('settings' == cid) {
        onOpenSettings();
    } else if ('accounts' == cid) {
        onOpenAccounts();
    } else {
        var report = reportsCollection.getByCid(cid);
        onReportChosen(report);
    }
}

function onOpenSettings()
{
    var settings = Alloy.createController('settings');
    settings.open();
    setCurrentlyOpenedReport(settings);
}

function onOpenAccounts()
{
    var accounts = Alloy.createController('accounts');
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
    setCurrentlyOpenedReport(accounts);
}

function refresh()
{
    reportsCollection.fetchAllReports(accountModel, siteModel);
}

function onAccountChosen(account)
{
    require('account').selectWebsite(account, onWebsiteSelected);
}

function onWebsiteSelected(site, account)
{
    siteModel = site;
    accountModel = account;
    openEntryReport();
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

function openEntryReport()
{
    closeCurrentlyOpenedReport();

    var statistics = Alloy.createController('compositereport', {account: accountModel,
                                                                site: siteModel});
    statistics.open();
    setCurrentlyOpenedReport(statistics);
}

exports.updateWebsite = function (newSiteModel) {
    siteModel = newSiteModel
}

exports.open = function() 
{
    require('layout').setLeftSidebar($.reportsTable);

    openEntryReport();

    refresh();
};