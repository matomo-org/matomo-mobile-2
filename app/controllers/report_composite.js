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
reportsCollection.on('forceRefresh', refresh);
reportsCollection.on('error', function (undefined, error) {
    if (error) {
        showReportHasNoData(error.getError(), error.getMessage());
    }
});

var dateHasChanged    = true;
var websiteHasChanged = true;
var reportIsDisplayed = true;

function registerEvents()
{
    Alloy.Collections.piwikReports.on('reset', render);

    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);

    $.content.addEventListener('scroll', notifyModelsAboutNewScrollPosition);
}

function unregisterEvents()
{
    Alloy.Collections.piwikReports.off('reset', render);
    
    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);

    $.content.removeEventListener('scroll', notifyModelsAboutNewScrollPosition);
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
    renderIfNeeded();
}

function onOpen()
{
    trackWindowRequest();
}

function onClose()
{
    unregisterEvents();

    $.destroy();
    $.off();
}

function hideLoadingIndicator()
{
    $.loadingIndicator.hide();
}

function showLoadingIndicator()
{
    $.loadingIndicator.show();
    $.content.hide();
    $.nodata.hide();
}

function showReportContent()
{
    $.content.show();
    $.nodata.hide();
    hideLoadingIndicator();
}

function showReportHasNoData(title, message)
{
    $.nodata.show({title: title, message: message});
    $.content.hide();
    hideLoadingIndicator();
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
    websiteHasChanged = true;

    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/composite/change/website'});

    renderIfNeeded();
}

function onDateChanged() 
{
    dateHasChanged = true;

    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/composite/change/date'});

    renderIfNeeded();
}

function renderIfNeeded()
{
    if (reportIsDisplayed && (dateHasChanged || websiteHasChanged)) {
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
        showReportContent();
        renderListOfReports();
        addPiwikIcon();
    } else {
        showReportHasNoData(L('Mobile_NoReportsShort'), null);
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

function notifyModelsAboutNewScrollPosition (event) 
{
    if (!event || !_.has(event, 'y')) {
        return;
    }
    
    _.forEach(filterReports(reportsCollection), function (model) {
        model.trigger('scrollPosition', {y: event.y});
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
            width: '55dp',
            height: '19dp',
            image: '/piwik_logo_dark_footer.png'
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

    if (isDataAlreadyFetched()) {
        renderIfNeeded();
    } else {
        refresh();
    }
}


function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open  = open;