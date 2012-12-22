var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel       = accountsCollection.first();
// the currently selected website
var siteModel          = null;
// A list of all available reports
var reportsCollection  = Alloy.createCollection('piwikReports');
// the currently selected report
var reportModel        = null;
// the fetched statistics that belongs to the currently selected report
var statisticsModel    = Alloy.Collections.piwikProcessedReport;

$.index.title = 'All Websites Dashboard';

function openStatistics() 
{
    Alloy.createController('statistics', {accounts: accountsCollection}).open();
    $.index.close();
    $.destroy();
}

function doChooseAccount()
{
    var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function onAccountChosen(account)
{
    accountModel            = account;
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    entrySiteCollection.fetch({
        params: {limit: 2},
        account: accountModel,
        success: function (entrySiteCollection) {

            if (1 == entrySiteCollection.length) {
                //TODO directly open this site, all websites dashboard makes no sense.
                // openStatistics();
            } else if (!entrySiteCollection.length) {
                // TODO no access to any account
            } else {
                // fetchListOfAvailalbeReports(entrySiteCollection.getEntrySite());
            }

            fetchListOfAvailalbeReports(entrySiteCollection.getEntrySite());
        }
    });
}

function fetchListOfAvailalbeReports(site)
{
    siteModel = site;
    reportsCollection.fetch({
        account: accountModel,
        params: {idSites: site.id},
        success : fetchListOfAvailableWebsites,
        error : function(model, resp) {
            // TODO what should we do in this case?
            statisticsModel.trigger('error', {type: 'loadingReportList'});
        }
    });
}

function doSelectWebsite(event)
{
    var cid     = event.rowData.cid;
    var website = statisticsModel.getByCid(cid);

    openStatistics();
}

var reportRowsCtrl = null;
function onStatisticsFetched(statisticsModel)
{
    showReportContent();

    return;
    $.reportGraphCtrl.update(statisticsModel, accountModel);
}

function showReportContent()
{
    $.loading.hide();
}

function showLoadingMessage()
{
    $.loading.show();
}

function fetchListOfAvailableWebsites() {

    showLoadingMessage();

    statisticsModel.fetch({
        account: accountModel,
        params: {
            period: 'day',
            date: 'today',
            idSite: siteModel.id,
            sortOrderColumn: "nb_visits",
            filter_sort_column: "nb_visits",
            apiModule: "MultiSites",
            apiAction: "getAll"
        },
        error: function () {
            statisticsModel.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

statisticsModel.on('error', function () {
    // TODO what should we do in this case?
    showReportContent();
});

exports.open = function () {
    showLoadingMessage();

    onAccountChosen(accountModel);
    require('alloy').Globals.layout.open($.index);
};
