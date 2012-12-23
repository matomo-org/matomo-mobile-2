var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel       = accountsCollection.first();
// the fetched statistics that belongs to the currently selected report
var statisticsModel    = Alloy.Collections.piwikProcessedReport;

$.index.title = 'All Websites Dashboard';

function openStatistics(siteModel) 
{
    // A list of all available reports
    var reportsCollection = Alloy.createCollection('piwikReports');

    var statistics = Alloy.createController('statistics', {accounts: accountsCollection,
                                                           reports: reportsCollection,
                                                           site: siteModel});

    if (require('alloy').isTablet) {

        var reports = Alloy.createController('availablereports', {reports: reportsCollection});
        reports.on('reportChosen', statistics.onReportChosen);
        require('layout').bootstrap(statistics, reports);
    } else {
        require('layout').bootstrap(statistics);
    }

}

function doChooseAccount()
{
    var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function onAccountChosen(account)
{
    showLoadingMessage();

    accountModel            = account;
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    entrySiteCollection.fetch({
        params: {limit: 2},
        account: accountModel,
        success: function (entrySiteCollection) {

            if (1 == entrySiteCollection.length) {
                openStatistics(entrySiteCollection.getEntrySite());
            } else if (!entrySiteCollection.length) {
                // TODO no access to any account
                alert('no access to any website');
            } else {
                fetchListOfAvailableWebsites(entrySiteCollection.getEntrySite());
            }
        }
    });
}

function doSelectWebsite(event)
{
    var id      = event.rowData.modelid;
    var website = statisticsModel.get(id);

    var siteModel = Alloy.createModel('PiwikWebsites', {idsite: website.get('reportMetadata').idsite,
                                                        name: website.get('label')});
    openStatistics(siteModel);
}

var reportRowsCtrl = null;
function onStatisticsFetched(statisticsModel)
{
    showReportContent();

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

function fetchListOfAvailableWebsites(site) 
{
    showLoadingMessage();

    statisticsModel.fetch({
        account: accountModel,
        params: {
            period: 'day',
            date: 'today',
            idSite: site.id,
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

    if (require('alloy').isHandheld) {
        require('alloy').Globals.layout.open($.index);
    } else {
        $.index.open();
    }
};
