/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var reportCategory    = args.reportCategory || null;
$.reportsCollection.off("fetch destroy change add remove reset", renderListOfReports);

var lastYScrollPosition = 0;
var dateHasChanged    = false;
var websiteHasChanged = false;
var segmentHasChanged = false;
var reportIsDisplayed = true;

$.emptyData = new (require('ui/emptydata'));

function registerEvents()
{
    $.reportsCollection.on('reset', render);
    $.reportsCollection.on('error', onFetchReportError);

    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);
    session.on('segmentChanged', onSegmentChanged);

    $.content.addEventListener('scroll', notifyModelsAboutNewScrollPosition);
}

function unregisterEvents()
{
    $.reportsCollection.off('reset', render);
    $.reportsCollection.off('error', onFetchReportError);
    $.reportsCollection.off();

    var session = require('session');
    session.off('websiteChanged', onWebsiteChanged);
    session.off('reportDateChanged', onDateChanged);
    session.off('segmentChanged', onSegmentChanged);

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
    $.emptyData && $.emptyData.cleanupIfNeeded();
}

function showReportContent()
{
    $.content.show();
    $.loadingIndicator.hide();
    $.emptyData && $.emptyData.cleanupIfNeeded();
}

function showReportHasNoData(title, message)
{
    $.emptyData.show($.index, refresh, title, message);

    $.content.hide();
    $.content.visible = false;
    $.loadingIndicator.hide();
    $.loadingIndicator.visible = false;
}

function toggleReportConfiguratorVisibility ()
{
    require('report/configurator').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Configurator', category: 'Report Composite'});
}

function toggleReportChooserVisibility()
{
    require('report/chooser').toggleVisibility();

    require('Piwik/Tracker').trackEvent({name: 'Toggle Report Chooser', category: 'Report Composite'});
}

function onWebsiteChanged()
{
    require('Piwik/Tracker').trackEvent({name: 'Website Changed', action: 'result', category: 'Report Composite'});

    websiteHasChanged = true;
    updateDisplayedReportsIfNeeded();
}

function onSegmentChanged()
{
    require('Piwik/Tracker').trackEvent({name: 'Segment Changed', action: 'result', category: 'Report Composite'});

    segmentHasChanged = true;
    updateDisplayedReportsIfNeeded();
}

function onDateChanged() 
{
    require('Piwik/Tracker').trackEvent({name: 'Date Changed', action: 'result', category: 'Report Composite'});

    dateHasChanged = true;
    updateDisplayedReportsIfNeeded();
}

function updateDisplayedReportsIfNeeded()
{
    if (reportIsDisplayed && (websiteHasChanged || segmentHasChanged)) {
        // website has changed and the available reports maybe changes (Goals), we need to fetch the list of reports
        // for then new website
        notifyModelsAboutWindowClose();
        refresh();
        dateHasChanged    = false;
        websiteHasChanged = false;
        segmentHasChanged = false;

    } else if (reportIsDisplayed && dateHasChanged) {
        // there is no need to fetch the list of reports again, we already have the list and there is no change
        // simply render the boxes again, those will recognize the new date
        notifyModelsAboutWindowClose();
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
        console.log('no website/account selected', 'report_composite');
        return;
    }

    showLoadingIndicator();
    $.reportsCollection.fetchAllReports(accountModel, siteModel);
}

function render()
{
    if (hasReportsToShow()) {
        lastYScrollPosition = 0;
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
    if (reportCategory && !collection.containsReportCategory(reportCategory)) {
        // we need to reset current selected category. For instance if user chooses different account, it is not
        // guarranteed he will have same dashboard name/category in that newly selected account. Otherwise we would
        // display nothing because it won't find same category there.
        reportCategory = null;
    }

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

var neededScrollChange = 70;

if (OS_ANDROID) {
    neededScrollChange = require('Piwik/Platform').dpToPixel(neededScrollChange);
}

function notifyModelsAboutNewScrollPosition (event)
{
    if (!event || !_.has(event, 'y')) {
        return;
    }

    if (lastYScrollPosition && event.y < (lastYScrollPosition + neededScrollChange)) {
        // ignore if scroll change was only 50 pixel or less since last update. otherwise we end up firing
        // thousands of events
        return;
    }

    lastYScrollPosition = event.y;

    _.forEach(filterReports($.reportsCollection), function (model) {
        if (lastYScrollPosition == event.y) {
            // the notifyModelsAboutNewScrollPosition can be triggered multiple times async. If meanwhile the
            // "global" variable lastYScrollPosition changes, trigger this event only if we are still the highest
            // lastYPosition
            model.trigger('scrollPosition', {y: lastYScrollPosition});
        }
    });
}


function notifyModelsAboutWindowClose ()
{
    _.forEach(filterReports($.reportsCollection), function (model) {
        model.trigger('windowClose');
    });
}

function hasReportsToShow()
{
    return !!$.reportsCollection.length;
}

function addPiwikIcon()
{
    if (OS_ANDROID) {
        $.content.add(Ti.UI.createImageView({
            top: '10dp',
            bottom: '25dp',
            width: '145dp',
            height: '19dp',
            image: '/images/piwik_logo_dark_footer.png'
        }));
    } else {
        $.content.add(Ti.UI.createImageView({
            top: 12,
            bottom: 25,
            width: 145,
            height: 19,
            image: 'piwik_logo_dark_footer.png'
        }));
    }
}

function open()
{
    // TODO it would be nice to be able to make use of animations on iOS. At the moment enabling
    // this animation causes the window title in report composite views to be not displayed. It'll work only
    // once but as soon as a windows is closed shortly before (happening when choosing a report in sidebar)
    // the title will be no longer displayed.
    var animated = OS_IOS ? false : true;

    registerEvents();
    require('layout').open($.index, animated);
    refresh();
}

function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open  = open;