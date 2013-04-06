function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel       = args.account || false;
// the currently selected website
var siteModel          = args.site || false;
// A list of all available reports
var reportsCollection  = args.reports || false;
// the currently selected report
var reportModel        = args.report || false;
// the fetched statistics that belongs to the currently selected report
var statisticsModel    = Alloy.createModel('piwikProcessedReport');

var displayedController = null;

$.index.setTitle(siteModel.getName());

function doChooseAccount()
{
    var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function doChooseWebsite()
{
    var params   = {account: accountModel, accounts: accountsCollection, autoOpen: false};
    var websites = Alloy.createController('allwebsitesdashboard', params);
    websites.on('websiteChosen', function () {
        this.close();
    });
    websites.on('websiteChosen', onWebsiteChosen)
    websites.open();
}
function onClose()
{
    $.destroy();
}

function clearContent()
{
    if (displayedController) {
        $.content.remove(displayedController.getView());
        displayedController.destroy();
        displayedController = null;
    }
}

function displayContent(controller)
{
    clearContent();

    displayedController = controller;
    $.content.add(displayedController.getView());
}

function onReportChosen (chosenReportModel) {
    reportModel = chosenReportModel;
    // currentMetric = null;

    refreshReport();
}

function refreshReport()
{
    var params = {
        account: accountModel, 
        site: siteModel, 
        report: reportModel,
        statistics: statisticsModel
    };

    var report = Alloy.createController('report', params);
    displayContent(report);
    report.refresh();
}

function onWebsiteChosen(event)
{
    siteModel    = event.site;
    accountModel = event.account;

    $.index.setTitle(siteModel.getName());
    refreshReport();
}

function onAccountChosen(account)
{
    accountModel            = account;
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    //TODO either display ALL WEBSITES DASHBOARD OR CHOOSE CORRECT WEBSITE
    var entrySite = entrySiteCollection.first();
    entrySiteCollection.fetch({
        params: {limit: 1},
        account: accountModel, 
        success: function (entrySiteCollection) {
            onWebsiteChosen({site: entrySite, account: accountModel});
        }
    });
}

function doRefresh() 
{
    if (displayContent && displayContent.refresh) {
        displayContent.refresh();
    }
}

statisticsModel.on('error', function () {
    // TODO what should we do in this case?
});

exports.open = function () {

    onReportChosen(reportModel);

    require('layout').open($.index);
};
