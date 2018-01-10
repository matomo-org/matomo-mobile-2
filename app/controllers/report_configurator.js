/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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

function hideRightSidebar () {
    require('layout').hideRightSidebar();
}

function open()
{
    require('layout').setRightSidebar($.index);
    fetchWebsites();
}

function reloadWebsitesIfNotLoadedDueToConnectivityIssues()
{
    if (!$.piwikWebsites.hasWebsites()) {
        // try to reload websites if
        fetchWebsites();
    }
}

function toggleVisibility() 
{
    reloadWebsitesIfNotLoadedDueToConnectivityIssues();

    require('layout').toggleRightSidebar();
}

function uncheckAllWebsites()
{
    if (!$.configTable || !$.configTable.data) {
        return;
    }

    _.forEach($.configTable.data, function (tableViewRowOrSection) {
        uncheckWebsite(tableViewRowOrSection);

        if (tableViewRowOrSection && tableViewRowOrSection.rows) {
            _.forEach(tableViewRowOrSection.rows, function (tableViewRow) {
                uncheckWebsite(tableViewRow);
            });
        }
    });
}

function uncheckWebsite(tableViewRow)
{
    if (!tableViewRow) {
        return;
    }

    tableViewRow.rightImage = OS_ANDROID ? '/images/blank.png' : null;
}

function checkWebsite(tableViewRow)
{
    if (!tableViewRow) {
        return;
    }
    
    tableViewRow.rightImage = OS_ANDROID ? '/images/ic_check_grey600_36dp.png' : 'tick.png';
}

function transformWebsite(processedReport)
{
    if (processedReport && processedReport.getSiteId()) {
        processedReport.idsite = processedReport.getSiteId();
    } else {
        processedReport.idsite = null;
    }

    processedReport.name = processedReport.getName();

    if (isCurrentWebsite(processedReport)) {
        checkWebsite(processedReport);
    } else {
        uncheckWebsite(processedReport);
    }

    return processedReport;
}

function isCurrentWebsite(processedReport)
{
    var currentWebsiteId = getSiteIdOfActiveWebsite();

    if (null !== currentWebsiteId && 
        processedReport && 
        processedReport.idsite == currentWebsiteId) {
        return true;
    }

    return false;
}

function selectWebsite(event)
{
    if (!event || !event.row || _.isUndefined(event.row.modelid) || _.isNull(event.row.modelid)) {
        console.log('ModelID in source not defined, cannot select website');
        return;
    }

    var id = event.row.modelid;
    var siteModel = $.piwikWebsites.get(id);

    if (!siteModel) {
        console.log('siteModel not found in collection, cannot select website');
        return;
    }

    var account = require('session').getAccount();

    require('session').setWebsite(siteModel, account);
    hideRightSidebar();
}

function fetchWebsites()
{
    var website = require('session').getWebsite();
    var account = require('session').getAccount();

    if (!website || !account) {
        console.info('cannot fetch website, no account or website', 'report_configurator');

        return;
    }

    var reportDate  = require('session').getReportDate();
    var piwikPeriod = reportDate ? reportDate.getPeriodQueryString() : 'day';
    var piwikDate   = reportDate ? reportDate.getDateQueryString() : 'today';

    $.piwikWebsites.fetchWebsites('nb_visits', {
        params: {
            period: piwikPeriod, 
            date: piwikDate, 
            idSite: website.getSiteId(),
            filter_limit: 20,
            hideMetricsDoc: 1,
            apiModule: "MultiSites",
            apiAction: "getAll",
            showColumns: 'nb_visits'
        },
        account: account
    });
}

function getActiveWebsiteModel()
{
    return require('session').getWebsite();
}

function getSiteIdOfActiveWebsite()
{
    var websiteModel = getActiveWebsiteModel();

    if (!websiteModel) {
        return null;
    }

    return websiteModel.getSiteId();
}

function checkWebsiteIfRowIsHasSiteId(tableViewRowOrSection, siteId)
{
    if (tableViewRowOrSection &&
        null !== tableViewRowOrSection.idsite && 
        tableViewRowOrSection.idsite == siteId) {
        checkWebsite(tableViewRowOrSection);
    }
}

function checkCurrentlyActiveWebsite()
{
    uncheckAllWebsites();

    if (!$.configTable || !$.configTable.data) {
        return;
    }

    var activeSiteId = getSiteIdOfActiveWebsite();

    _.forEach($.configTable.data, function (tableViewRowOrSection) {
        checkWebsiteIfRowIsHasSiteId(tableViewRowOrSection, activeSiteId);

        if (tableViewRowOrSection && tableViewRowOrSection.rows) {
            _.forEach(tableViewRowOrSection.rows, function (tableViewRow) {
                checkWebsiteIfRowIsHasSiteId(tableViewRow, activeSiteId);
            });
        }
    });
}

require('session').on('accountChanged', fetchWebsites);
require('session').on('websiteChanged', checkCurrentlyActiveWebsite);

exports.open = open;
exports.toggleVisibility = toggleVisibility;