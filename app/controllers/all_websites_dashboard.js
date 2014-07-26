/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};
if (args && args.enableGoBack) {
    $.index.leftNavButton = null;
}

function L(key, substitution)
{
    var translation = require('L')(key);

    if (substitution) {
        return String.format(translation, '' + substitution);
    }

    return translation;
}

var emptyData = new (require('ui/emptydata'));
var accountsCollection = Alloy.Collections.appAccounts;
var processedReport    = Alloy.createCollection('piwikProcessedReport');
var accountModel       = accountsCollection.lastUsedAccount();

$.piwikWebsites.off("fetch destroy change add remove reset", renderWebsites);
$.piwikWebsites.on('reset', render);
$.piwikWebsites.on('error', function (undefined, error) {
    if (error) {
        showMessageNoWebsitesFound(error.getError(), error.getMessage());
    }
});

function onOpen()
{
    require('Piwik/Tracker').trackWindow('All Websites Dashboard', 'all-websites-dashboard');
}

function onClose()
{
    emptyData && emptyData.cleanupIfNeeded();

    if (processedReport) {
        processedReport.abortRunningRequests();
    }

    if (OS_ANDROID && $.websitesTable) {
        // prevent tableViewRows from leaking memory
        $.websitesTable.setData([]);
    }

    $.trigger('close');

    $.destroy();
    $.off();
}

function websiteChosen(siteModel) 
{
    $.trigger('websiteChosen', {site: siteModel, account: accountModel});
}

function chooseAccount()
{
    require('Piwik/Tracker').trackEvent({name: 'Choose Account', category: 'All Websites Dashboard'});

    var accounts = Alloy.createController('accounts_selector');
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}

function onAccountChosen(account)
{
    this.close();
    require('Piwik/Tracker').trackEvent({name: 'Account Chosen', action: 'result', category: 'All Websites Dashboard'});

    accountModel = account;
    fetchListOfAvailableWebsites();
}

function selectWebsite(event)
{
    if (!event || !event.row || !_.has(event.row, 'modelid')) {
        console.log('ModelID not defined, cannot select website');
        return;
    }

    var id = event.row.modelid;
    var siteModel = $.piwikWebsites.get(id);

    if (!siteModel) {
        console.log('websiteModel not found in collection, cannot select website');
        return;
    }

    websiteChosen(siteModel);
}

function fetchImageGraphUrlToRenderGraph()
{
    if (!$.reportGraphCtrl) {
        return;
    }

    if (!accountModel || !hasFoundWebsites()) {
        console.info('cannot fetch image graph url to render graph, no account set or no website', 'all_websites_dashboard');
        return;
    }

    var siteId = $.piwikWebsites.first().getSiteId();

    // TODO fallback to day/today is not a good solution cause user won't notice we've fallen back to a different date
    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    // You are wondering why we do not directly fetch the websites using "API.getProcessedReport"? Because
    // "API.getProcessedReport" needs a websiteId although "MultiSites.getAll" does not need it. So there are two
    // possibilities... We execute a request to fetch one websiteID up-front and then fetch all Websites using
    // "API.getProcessedReport". Or we use "MultiSites.getAll" and do the additional request only for devices that
    // actually display the graph (tablets). We go with the second possibility because an additional request is
    // expensive, especially on mobile. That means we fetch the websites using "MultiSites.getAll". Once this is done,
    // we execute an additional request on tablets using "API.getProcessedReport(module=MultiSites,action=getAll)"
    // to get the corresponding ImageGraphUrl. Only a "ProcessedReport" contains the imageGraphUrl.
    processedReport.fetchProcessedReports('nb_visits', {
        account: accountModel,
        params: {
            period: piwikPeriod,
            date: piwikDate,
            idSite: siteId,
            apiModule: 'MultiSites',
            apiAction: 'getAll',
            filter_limit: 1,
            showColumns: 'nb_visits',
            hideMetricsDoc: 1
        },
        success: function () {
            if (hasUsedSearch()) {
                $.reportGraphCtrl.update(processedReport, accountModel, {pattern: getSearchText()});
            } else {
                $.reportGraphCtrl.update(processedReport, accountModel);
            }
        },
        error: function (undefined, error) {
            // TODO what should we do here? maybe we need some kind of an "error" image but should not contain any text
        }
    });
}

function render()
{
    if (!hasFoundWebsites() && hasUsedSearch()) {
        var params = {title: L('SitesManager_NotFound') + ' ' + getSearchText()};
        $.websitesTable.setData([Alloy.createWidget('org.piwik.tableviewrow', null, params).getRow()]);
        showReportContent();
    } else if (!hasFoundWebsites()) {
        showMessageNoWebsitesFound(L('Mobile_NoWebsitesShort'), L('Mobile_NoWebsiteFound'));
    } else {
        showReportContent();
        renderWebsites();
    }

    fetchImageGraphUrlToRenderGraph();

    if (hasMoreWebsitesThanDisplayed()) {
        showUseSearchHint();
    }
}

function showReportContent()
{
    $.content.show();
    $.content.visible = true;
    $.loading.hide();
    $.loading.visible = false;
    emptyData && emptyData.cleanupIfNeeded();
}

function showLoadingMessage()
{
    $.loading.show();
}

function cancelSearchWebsite() 
{
    if (!$.searchBar) {

        return;
    }
    
    $.searchBar.value = '';
    $.searchBar.blur();

    fetchListOfAvailableWebsites();
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

function refresh()
{
    if (hasUsedSearch()) {
        searchWebsite();
    } else {
        fetchListOfAvailableWebsites();
    }
}

function searchWebsite()
{
    if (!accountModel) {
        console.info('cannot search website, no account set', 'all_websites_dashboard');
        return;
    }

    showLoadingMessage();
    
    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikWebsites.fetchWebsites('nb_visits', {
        account: accountModel,
        params: {
            period: piwikPeriod, 
            date: piwikDate, 
            enhanced: 1,
            pattern: getSearchText(),
            filter_limit: Alloy.CFG.numDisplayedWebsitesInDashboard
        }
    });

    $.searchBar.blur();

    require('Piwik/Tracker').trackEvent({name: 'Websites Search', category: 'All Websites Dashboard'});
}

function getNumberOfFoundWebsites()
{
    return $.piwikWebsites.getNumberOfWebsites();
}

function hasFoundWebsites()
{
    return $.piwikWebsites.hasWebsites();
}

function hasMoreWebsitesThanDisplayed()
{
    var limit = Alloy.CFG.numDisplayedWebsitesInDashboard;

    return limit <= getNumberOfFoundWebsites();
}

function showMessageNoWebsitesFound(title, message)
{
    emptyData.show($.index, refresh, title, message);

    $.loading.hide();
    $.loading.visible = false;
    $.content.hide();
    $.content.visible = false;
}

function showUseSearchHint()
{
    $.useSearchHintContainer.show();
}

function fetchListOfAvailableWebsites()
{
    showLoadingMessage();

    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikWebsites.fetchWebsites("nb_visits", {
        account: accountModel,
        params: {
            period: piwikPeriod, 
            date: piwikDate,
            showColumns: 'nb_visits,visits_evolution',
            filter_limit: Alloy.CFG.numDisplayedWebsitesInDashboard
        }
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

    var visitsEvolution = model.get('visits_evolution');

    if (!visitsEvolution) {
        // visitsEvolution is not set in case lastX/previousX/range is used
        model.set('evolution_color', '#8e8e93');
    } else if (isNegativeEvolution(visitsEvolution)) {
        model.set('evolution_color', '#800000');
    } else {
        model.set('evolution_color', '#008000');
    } 
    
    var evolution = model.get('nb_visits');
    if (visitsEvolution) {
        evolution = String.format('%s (%s)', '' + model.get('nb_visits'), '' + visitsEvolution);
    }
    
    model.set('evolution', evolution);

    return model;
}

exports.enableCanGoBack = function ()
{
    if (OS_ANDROID) {
        $.headerBar.enableCanGoBack();
        $.headerBar.on('back', function () {
            $.close();
        });
    }
};

exports.close = function () {
    require('layout').close($.index);
};

exports.open = function () {
    require('layout').open($.index);

    fetchListOfAvailableWebsites();
};
