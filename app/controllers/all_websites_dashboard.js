function L(key, substitution)
{
    var translation = require('L')(key);

    if (substitution) {
        return String.format(translation, '' + substitution);
    }

    return translation;
}

if (OS_IOS) {
    $.pullToRefresh.init($.websitesTable);
}

var accountsCollection = Alloy.Collections.appAccounts;
var accountModel       = accountsCollection.lastUsedAccount();

var args     = arguments[0] || {};
var autoOpen = true;
if ('undefined' !== (typeof args.openWebsiteAutomaticallyIfOnlyOneWebsiteIsAvailable) &&
    null !== args.openWebsiteAutomaticallyIfOnlyOneWebsiteIsAvailable) {
    autoOpen = args.openWebsiteAutomaticallyIfOnlyOneWebsiteIsAvailable;
}

var lastUsedWebsite = null;

function onOpen()
{
    require('Piwik/Tracker').trackWindow('All Websites Dashboard', 'all-websites-dashboard');
}

function onClose()
{
    $.piwikProcessedReport.off('reset', displayMessageIfNoWebsitesFound);
    $.destroy();
}

function websiteChosen(siteModel) 
{
    $.trigger('websiteChosen', {site: siteModel, account: accountModel});
}

function chooseAccount()
{
    require('Piwik/Tracker').trackEvent({title: 'Choose Account', 
                                         url: '/all-websites-dashboard/choose-account'});

    var accounts = Alloy.createController('accounts_selector');
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function onAccountChosen(account)
{
    require('Piwik/Tracker').trackEvent({title: 'Account Chosen', 
                                         url: '/all-websites-dashboard/account-chosen'});
    loadWebsitesForAccount(account);
}

function loadWebsitesForAccount(account)
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
                console.error('no access to any website');
            } else {
                fetchListOfAvailableWebsites(entrySiteCollection.first());
            }
        }
    });
}

function selectWebsite(event)
{
    if (!event || !event.rowData || null === event.rowData.modelid) {
        console.log('ModelID not defined, cannot select website');
        return;
    }

    var id      = event.rowData.modelid;
    var website = $.piwikProcessedReport.get(id);

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

    if ($.reportGraphCtrl) {
        $.reportGraphCtrl.update(statisticsCollection, accountModel);
    }
}

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loading.hide();
}

function showLoadingMessage()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    }
    
    $.loading.show();
}

function cancelSearchWebsite() 
{
    if (!$.searchBar) {

        return;
    }
    
    $.searchBar.value = '';
    $.searchBar.blur();

    doRefresh();
}

function searchWebsite(event) 
{
    showLoadingMessage();

    $.piwikProcessedReport.fetchProcessedReports('nb_visits', {
        account: accountModel,
        params: {
            period: 'day',
            date: 'today',
            enhanced: 1,
            idSite: lastUsedWebsite.id,
            apiModule: "MultiSites",
            apiAction: "getAll",
            pattern: $.searchBar.value,
            filter_limit: Alloy.CFG.numDisplayedWebsitesInDashboard
        },
        error: function () {
            $.piwikProcessedReport.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });

    $.searchBar.blur();

    require('Piwik/Tracker').trackEvent({title: 'Websites Search', url: '/all-websites-dashboard/search'});
}

function getNumberOfFoundWebsites()
{
    return $.piwikProcessedReport.length;
}

function hasFoundWebsites()
{
    return !!getNumberOfFoundWebsites();
}

function hasMoreWebsitesThanDisplayed()
{
    var limit = Alloy.CFG.numDisplayedWebsitesInDashboard;

    return limit <= getNumberOfFoundWebsites();
}

function showMessageNoWebsitesFound()
{
    if (OS_MOBILEWEB){
        $.noWebsiteFoundContainer.height = Ti.UI.FILL;
    } else {
        $.websitesTable.headerView = $.noWebsiteFoundContainer;
    }

    $.noWebsiteFoundContainer.show();
}

function hideMessageNoWebsitesFound()
{
    $.noWebsiteFoundContainer.hide();

    // this is usually not needed but looks like a bug in Titanium... 
    // Otherwise Headerview would always stay with height=Ti.UI.FILL once displayed
    if (OS_MOBILEWEB){
        $.noWebsiteFoundContainer.height = 0;
    } else {
        $.websitesTable.headerView = null;
    }
}

function showUseSearchHint()
{
    $.useSearchHintContainer.show();
}

function displayMessageIfNoWebsitesFound () 
{
    if (hasFoundWebsites()) {
        hideMessageNoWebsitesFound();
    } else {
        showMessageNoWebsitesFound();
    }

    if (hasMoreWebsitesThanDisplayed()) {
        showUseSearchHint();
    } 
}

function doRefresh()
{
    if (lastUsedWebsite) {
        fetchListOfAvailableWebsites(lastUsedWebsite);
    }
}

function fetchListOfAvailableWebsites(site) 
{
    lastUsedWebsite = site;
    showLoadingMessage();

    var reportDate = require('session').getReportDate();

    $.piwikProcessedReport.fetchProcessedReports("nb_visits", {
        account: accountModel,
        params: {
            period: reportDate.getPeriodQueryString(), 
            date: reportDate.getDateQueryString(), 
            idSite: site.id,
            apiModule: "MultiSites",
            apiAction: "getAll",
            filter_limit: Alloy.CFG.numDisplayedWebsitesInDashboard
        },
        error: function () {
            $.piwikProcessedReport.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: onStatisticsFetched
    });
}

function isNegativeEvolution(evolution)
{
    return (evolution && '-' == (evolution+'').substr(0, 1));
}

function formatWebsite(model)
{
    var evolution = model.get('visits_evolution');

    if (isNegativeEvolution(evolution)) {
        model.set('evolution_color', '#800000');
    } else {
        model.set('evolution_color', '#008000');
    }

    return model;
}

$.piwikProcessedReport.on('error', function () {
    // TODO what should we do in this case?
    showReportContent();
});

$.piwikProcessedReport.on('reset', displayMessageIfNoWebsitesFound);

exports.close = function () {
    require('layout').close($.index);
    $.destroy();
};

exports.open = function (alreadyOpened) {
    showLoadingMessage();

    loadWebsitesForAccount(accountModel);

    require('layout').open($.index);
};
