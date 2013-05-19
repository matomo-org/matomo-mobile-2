/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function onClose()
{
    $.destroy();
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

function selectWebsite(event)
{
    if (!event || !event.source || null === event.source.modelid) {
        console.log('ModelID in source not defined, cannot select website');
        return;
    }

    var id      = event.source.modelid;
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
            filter_limit: 25,
            hideMetricsDoc: 1,
            apiModule: "MultiSites",
            apiAction: "getAll",
            showColumns: 'nb_visits'
        },
        account: account
    });
}

require('session').on('accountChanged', fetchWebsites);

exports.open = open;
exports.toggleVisibility = toggleVisibility;