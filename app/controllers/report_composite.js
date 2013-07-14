/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var reportCategory    = args.reportCategory || null;
var reportsCollection = Alloy.Collections.piwikReports;
reportsCollection.off("fetch destroy change add remove reset", renderListOfReports);

var dateHasChanged    = false;
var websiteHasChanged = false;
var reportIsDisplayed = true;

$.emptyData = new (require('ui/emptydata'));

function registerEvents()
{
    reportsCollection.on('reset', render);
    reportsCollection.on('forceRefresh', refresh);
    reportsCollection.on('error', onFetchReportError);

    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
}

function unregisterEvents()
{
    reportsCollection.off('reset', render);
    reportsCollection.off('forceRefresh', refresh);
    reportsCollection.off('error', onFetchReportError);

    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);
}

function trackWindowRequest()
{
    var category = reportCategory ? reportCategory : '';
    require('Piwik/Tracker').setCustomVariable(1, 'reportCategory', category, 'page');

    require('Piwik/Tracker').trackWindow('Composite Report', 'report/composite');
}

function onBlur()
{
    reportIsDisplayed = false;
}

function onFocus()
{
    reportIsDisplayed = true;
    updateDisplayedReportsIfNeeded();
}

function onFetchReportError(undefined, error)
{
    if (error) {
        showReportHasNoData(error.getError(), error.getMessage());
    }
}

function onOpen()
{
    trackWindowRequest();

    if (isDataAlreadyFetched()) {
        render();
    } else {
        refresh();
    }
}

function onClose()
{
    $.emptyData && $.emptyData.cleanupIfNeeded();

    unregisterEvents();
    notifyModelsAboutWindowClose();

    $.destroy();
    $.off();
}

function showLoadingIndicator()
{
    $.loadingIndicator.show();
    $.content.hide();
    $.emptyData.cleanupIfNeeded();
}

function showReportContent()
{
    $.content.show();
    $.loadingIndicator.hide();
    $.emptyData.cleanupIfNeeded();
}

function showReportHasNoData(title, message)
{
    $.emptyData.show($.index, refresh, title, message);

    $.content.hide();
    $.content.visible = false;
    $.loadingIndicator.hide();
    $.loadingIndicator.visible = false;
}

function toggleReportConfiguratorVisibility (event)
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Configurator', url: '/report/composite/toggle/report-configurator'});
}

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({title: 'Toggle Report Chooser', url: '/report/composite/toggle/report-chooser'});
}

function onWebsiteChanged()
{
    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/composite/change/website'});

    websiteHasChanged = true;
    updateDisplayedReportsIfNeeded();
}

function onDateChanged() 
{
    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/composite/change/date'});

    dateHasChanged = true;
    updateDisplayedReportsIfNeeded();
}

function updateDisplayedReportsIfNeeded()
{
    if (reportIsDisplayed && websiteHasChanged) {
        // website has changed and the available reports maybe changes (Goals), we need to fetch the list of reports
        // for then new website
        refresh();
        dateHasChanged    = false;
        websiteHasChanged = false;

    } else if (reportIsDisplayed && dateHasChanged) {
        // there is no need to fetch the list of reports again, we already have the list and there is no change
        // simply render the boxes again, those will recognize the new date
        render();
        dateHasChanged    = false;
        websiteHasChanged = false;
    }
}

function refresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    if (!siteModel || !accountModel) {
        console.log('no website/account selected', 'report_chooser');
        return;
    }

    showLoadingIndicator();
    reportsCollection.fetchAllReports(accountModel, siteModel);
}

function render()
{
    if (hasReportsToShow()) {
        renderListOfReports();
        showReportContent();
        addPiwikIcon();
    } else {
        showReportHasNoData(L('Mobile_NoReportsShort'), L('CoreHome_ThereIsNoDataForThisReport'));
    }
}

function updateWindowTitle(title)
{
    if (OS_ANDROID) {
        $.headerBar.setTitle(title || '');
    } else {
        $.index.title = title || '';
    }
}

function filterReports(collection)
{
    if (!reportCategory) {
        var entryReport = collection.getEntryReport();

        if (!entryReport) {
            return collection;
        }
        
        reportCategory = entryReport.get('category');
    }

    updateWindowTitle(reportCategory);

    return collection.where({category: reportCategory});
}

function notifyModelsAboutWindowClose ()
{
    _.forEach(filterReports(reportsCollection), function (model) {
        model.trigger('windowClose');
    });
}

function hasReportsToShow()
{
    return !!reportsCollection.length;
}

function isDataAlreadyFetched()
{
    return !!reportsCollection.length;
}

function addPiwikIcon()
{
    if (OS_ANDROID) {
        $.content.add(Ti.UI.createImageView({
            top: '10dp',
            bottom: '25dp',
            width: '56dp',
            height: '20dp',
            image: '/images/piwik_logo_dark_footer.png'
        }));
    } else {
        $.content.add(Ti.UI.createImageView({
            top: 12,
            bottom: 25,
            width: 55,
            height: 19,
            image: 'piwik_logo_dark_footer.png'
        }));
    }
}

function open()
{
    registerEvents();
    require('layout').open($.index);
}


function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open  = open;