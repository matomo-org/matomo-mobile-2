function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel = args.account || false;
// the fetched statistics that belongs to the currently selected report
var statisticsModel = Alloy.Collections.piwikProcessedReport;
// whether to open a website automatically if only one website is available
var autoOpen = true;
if ('undefined' === (typeof args.autoOpen)) {
    autoOpen = args.autoOpen;
}

var lastUsedWebsite = null;

function websiteChosen(siteModel) 
{
    $.trigger('websiteChosen', {site: siteModel, account: accountModel});
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

            if (autoOpen && 1 == entrySiteCollection.length) {
                websiteChosen(entrySiteCollection.first());
            } else if (!entrySiteCollection.length) {
                // TODO no access to any account
                alert('no access to any website');
            } else {
                fetchListOfAvailableWebsites(entrySiteCollection.first());
            }
        }
    });
}

function doSelectWebsite(event)
{
    if (!event || !event.rowData || !event.rowData.modelid) {
        console.log('ModelID not defined, cannot select website');
        return;
    }

    var id      = event.rowData.modelid;
    var website = statisticsModel.get(id);

    if (!website) {
        console.log('websiteModel not found in collection, cannot select website');
        return;
    }

    var siteModel = Alloy.createModel('PiwikWebsites', {idsite: website.get('reportMetadata').idsite,
                                                        name: website.get('label')});
    websiteChosen(siteModel);
}

var reportRowsCtrl = null;
function onStatisticsFetched(statisticsCollection)
{
    showReportContent();

    $.reportGraphCtrl.update(statisticsCollection.first(), accountModel);
}

function showReportContent()
{
    $.loading.hide();
}

function showLoadingMessage()
{
    $.loading.show();
}

function doCancelSearchWebsite() 
{
    if (!$.searchBar) {

        return;
    }
    
    $.searchBar.value = '';
    $.searchBar.blur();

    fetchListOfAvailableWebsites(lastUsedWebsite);
}

function doSearchWebsite(event) 
{
    showLoadingMessage();

    statisticsModel.fetch({
        account: accountModel,
        params: {
            period: 'day',
            date: 'today',
            idSite: lastUsedWebsite.id,
            sortOrderColumn: "nb_visits",
            filter_sort_column: "nb_visits",
            apiModule: "MultiSites",
            apiAction: "getAll",
            pattern: $.searchBar.value
        },
        error: function () {
            statisticsModel.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });

    $.searchBar.blur();
}

function fetchListOfAvailableWebsites(site) 
{
    lastUsedWebsite = site;
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

exports.close = function () {
    require('layout').close($.index);
    $.destroy();
};

exports.open = function (alreadyOpened) {
    showLoadingMessage();

    onAccountChosen(accountModel);

    require('layout').open($.index);
};
