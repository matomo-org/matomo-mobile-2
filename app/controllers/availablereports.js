function L(key)
{
    return require('L')(key);
}

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
    rows.push(Alloy.createController('availablereportrow', {title: L('General_Help'), cid: 'help'}).getView());

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
        openLiveVisitors();
    } else if ('visitorlog' == cid) {
        openVisitorLog();
    } else if ('visitormap' == cid) {
        openVisitorMap();
    } else if ('settings' == cid) {
        openSettings();
    } else if ('help' == cid) {
        openHelp();
    } else if ('accounts' == cid) {
        chooseAccount();
    } else {
        var report = reportsCollection.getByCid(cid);
        openCompositeReport(report);
    }
}

function openHelp()
{
    var help = Alloy.createController('help');
    help.open();
    setCurrentlyOpenedReport(help);
}

function openSettings()
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

function chooseAccount(account)
{
    require('account').selectWebsite(account, onWebsiteSelected);
}

function onWebsiteSelected(siteModel, accountModel)
{
    require('session').setWebsite(siteModel, accountModel);

    openEntryReport();
}

function openCompositeReport(chosenReportModel)
{
    var reportCategory = chosenReportModel.get('category');
    var statistics     = Alloy.createController('compositereport', {reportCategory: reportCategory});
    statistics.open();
    setCurrentlyOpenedReport(statistics);
}

function openLiveVisitors()
{
    var live = Alloy.createController('livevisitors');
    live.open();
    setCurrentlyOpenedReport(live);
}

function openVisitorLog()
{
    var log = Alloy.createController('visitorlog');
    log.open();
    setCurrentlyOpenedReport(log);
}

function openVisitorMap()
{
    var realtimemap = Alloy.createController('realtime_map');
    realtimemap.open();
    setCurrentlyOpenedReport(realtimemap);
}

function refresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    reportsCollection.fetchAllReports(accountModel, siteModel);
}

function setCurrentlyOpenedReport(controller)
{
    currentlyActiveReport = controller;
}

function openEntryReport()
{
    closeCurrentlyOpenedReport();

    // TODO we cannot just use Visits Summary
    var compositeReport = Alloy.createController('compositereport', {reportCategory: 'Visits Summary'});
    compositeReport.open();
    setCurrentlyOpenedReport(compositeReport);
}

exports.open = function() 
{
    require('layout').setLeftSidebar($.reportsTable);

    openEntryReport();

    refresh();
};