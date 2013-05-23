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

function hideRightSidebar () {
    require('layout').hideRightSidebar();
}

function open()
{
    require('layout').setRightSidebar($.index);
    fetchWebsites();
}

function toggleVisibility() 
{
    require('layout').toggleRightSidebar();
}

function uncheckAllWebsites()
{
    _.forEach($.configTable.data, function (tableViewRowOrSection) {
        uncheckWebsite(tableViewRowOrSection);

        if (tableViewRowOrSection.rows) {
            _.forEach(tableViewRowOrSection.rows, function (tableViewRow) {
                uncheckWebsite(tableViewRow);
            });
        }
    });
}

function uncheckWebsite(tableViewRow)
{
    tableViewRow.rightImage = OS_ANDROID ? '/blank.png' : null;
}

function checkWebsite(tableViewRow)
{
    tableViewRow.rightImage = OS_ANDROID ? '/tick.png' : 'tick.png';
}

function transformWebsite(processedReport)
{
    if (processedReport && 
        processedReport.getReportMetadata() && 
        processedReport.getReportMetadata().idsite) {
        processedReport.idsite = processedReport.getReportMetadata().idsite;
    } else {
        processedReport.idsite = null;
    }

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

    var id      = event.row.modelid;
    var website = $.piwikProcessedReport.get(id);

    if (!website) {
        console.log('websiteModel not found in collection, cannot select website');
        return;
    }

    var siteModel = Alloy.createModel('PiwikWebsites', {idsite: website.get('reportMetadata').idsite,
                                                        name: website.get('label')});
    var account   = require('session').getAccount();

    require('session').setWebsite(siteModel, account);
    toggleVisibility();
}

function fetchWebsites()
{
    var reportDate = require('session').getReportDate();
    var website    = require('session').getWebsite();
    var account    = require('session').getAccount();

    $.piwikProcessedReport.fetchProcessedReports('nb_visits', {
        params: {
            period: reportDate.getPeriodQueryString(), 
            date: reportDate.getDateQueryString(), 
            idSite: website.get('idsite'),
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

    var activeSiteId = getSiteIdOfActiveWebsite();

    _.forEach($.configTable.data, function (tableViewRowOrSection) {
        checkWebsiteIfRowIsHasSiteId(tableViewRowOrSection, activeSiteId);

        if (tableViewRowOrSection.rows) {
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