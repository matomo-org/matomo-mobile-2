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
var reportDate        = require('session').getReportDate();

function registerEvents()
{
    Alloy.Collections.piwikReports.on('reset', hideLoadingIndicator);
    Alloy.Collections.piwikReports.on('reset', addPiwikIcon);

    var session = require('session');
    session.on('websiteChanged', onWebsiteChanged);
    session.on('reportDateChanged', onDateChanged);

    $.content.addEventListener('scroll', notifyModelsAboutNewScrollPosition);
}

function unregisterEvents()
{
    Alloy.Collections.piwikReports.off('reset', hideLoadingIndicator);
    Alloy.Collections.piwikReports.off('reset', addPiwikIcon);
    
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

var accountModel = require('session').getAccount();

function accountDidNotChange()
{
    return require('session').getAccount().isSameAccount(accountModel);
}

function onWebsiteChanged()
{
    if (accountDidNotChange()) {
        render();
    } else {
        // let reportChooser to the refresh
    }

    require('Piwik/Tracker').trackEvent({title: 'Website Changed', url: '/report/composite/change/website'});
}

function onDateChanged() 
{
    if (accountDidNotChange()) {
        render();
    } else {
        // let reportChooser to the refresh
    }

    require('Piwik/Tracker').trackEvent({title: 'Date Changed', url: '/report/composite/change/date'});
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
        
        reportCategory  = entryReport.get('category');
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

function render()
{
    renderListOfReports();
    addPiwikIcon();
}

function open()
{
    registerEvents();
    require('layout').open($.index);

    if (isDataAlreadyFetched()) {
        hideLoadingIndicator();
        render();
    } else {
        showLoadingIndicator();
    }
}


function close()
{
    require('layout').close($.index);
}

exports.close = close;
exports.open  = open;