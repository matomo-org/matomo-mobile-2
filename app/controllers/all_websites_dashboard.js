/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
    $.off();
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
    if (!account) {
        console.info('No account given, cannot load websites for account', 'all_websites_dashboard');
        return;
    }

    showLoadingMessage();

    accountModel            = account;
    var entrySiteCollection = Alloy.createCollection('piwikWebsites');
    entrySiteCollection.fetch({
        params: {limit: 2},
        account: accountModel,
        success: function (entrySiteCollection) {
            if (!entrySiteCollection) {
                console.log('No entrySiteCollection defined, cannot select a website');

                return;
            }

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
    if (!event || !event.row || !_.has(event.row, 'modelid')) {
        console.log('ModelID not defined, cannot select website');
        return;
    }

    var id      = event.row.modelid;
    var website = $.piwikProcessedReport.get(id);

    if (!website) {
        console.log('websiteModel not found in collection, cannot select website');
        return;
    }

    var idSite = website.getReportMetadata() ? website.getReportMetadata().idsite : null;
    var websiteName = website.getTitle();

    var siteModel = Alloy.createModel('PiwikWebsites', {idsite: idSite, name: websiteName});
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

function getSearchText()
{
    if ($.searchBar) {
        return $.searchBar.value;
    }

    return '';
}

function hasUsedSearch()
{
    return !!getSearchText();
}

function searchWebsite(event) 
{
    if (!accountModel) {
        console.info('cannot search website, no account set', 'all_websites_dashboard');
        return;
    }

    if (!lastUsedWebsite) {
        console.info('cannot search website, no last used website', 'all_websites_dashboard');
        return;
    }

    showLoadingMessage();
    
    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikProcessedReport.fetchProcessedReports('nb_visits', {
        account: accountModel,
        params: {
            period: piwikPeriod, 
            date: piwikDate, 
            enhanced: 1,
            idSite: lastUsedWebsite.id,
            apiModule: "MultiSites",
            apiAction: "getAll",
            pattern: getSearchText(),
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
    return $.piwikProcessedReport.getNumberOfReports();
}

function hasFoundWebsites()
{
    return $.piwikProcessedReport.hasReports();
}

function hasMoreWebsitesThanDisplayed()
{
    var limit = Alloy.CFG.numDisplayedWebsitesInDashboard;

    return limit <= getNumberOfFoundWebsites();
}

function showMessageNoWebsitesFound()
{
    $.nodata.show({title: L('Mobile_NoWebsitesShort'), message: L('Mobile_NoWebsiteFound')});
    $.content.hide();
    $.loading.hide();
}

function hideMessageNoWebsitesFound()
{
    $.nodata.hide();
    $.content.show();
    $.loading.hide();
}

function showUseSearchHint()
{
    $.useSearchHintContainer.show();
}

function displayMessageIfNoWebsitesFound () 
{
    if (!hasFoundWebsites() && hasUsedSearch()) {
        $.websitesTable.setData([{title: L('SitesManager_NotFound') + ' ' + getSearchText()}]);
    } else if (!hasFoundWebsites()) {
        showMessageNoWebsitesFound();
    } else {
        hideMessageNoWebsitesFound();
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
    if (!site) {
        console.info('Cannot fetch list of available websites, no website given', 'all_websites_dashboard');
        return;
    }

    lastUsedWebsite = site;
    showLoadingMessage();

    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikProcessedReport.fetchProcessedReports("nb_visits", {
        account: accountModel,
        params: {
            period: piwikPeriod, 
            date: piwikDate, 
            idSite: site.id,
            apiModule: 'MultiSites',
            apiAction: 'getAll',
            showColumns: 'nb_visits,visits_evolution',
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
    if (!model) {

        return model;
    }

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
};

exports.open = function () {
    loadWebsitesForAccount(accountModel);

    require('layout').open($.index);
};
