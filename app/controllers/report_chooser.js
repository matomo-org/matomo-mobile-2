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

var reportsCollection = Alloy.Collections.piwikReports;
reportsCollection.on('reset', updateAvailableReportsList);

var currentlyActiveReport = null;

var cidToSelect = '';

function updateAvailableReportsList()
{
    if (!reportsCollection) {
        return;
    }
    
    var rows = [];
    var currentSection = null;
    var latestSection  = null;

    rows.push(Alloy.createController('report_chooser_section', {title: L('General_Live')}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('UserCountryMap_RealTimeMap'), cid: 'visitormap'}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('Live_VisitorsInRealTime'), cid: 'live'}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('Live_VisitorLog'), cid: 'visitorlog'}).getView());
    rows.push(Alloy.createController('report_chooser_section', {title: L('General_Reports')}).getView());

    if (!cidToSelect) {
        setCurrentlySelectedCid(getCidOfEntryReport(reportsCollection));
    }

    reportsCollection.forEach(function (report) 
    {
        currentSection = report.get('category');

        if ('MultiSites' == report.get('module') || 'API' == report.get('module')) {
            // we do not display this report
            return;
        }

        if (currentSection && currentSection !== latestSection) {
            rows.push(Alloy.createController('report_chooser_row', {title: currentSection, cid: report.cid}).getView());
            latestSection = currentSection;
        }
    });

    rows.push(Alloy.createController('report_chooser_section', {title: L('CoreAdminHome_MenuManage')}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('Mobile_Accounts'), cid: 'accounts'}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('General_Settings'), cid: 'settings'}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('General_Help'), cid: 'help'}).getView());
    rows.push(Alloy.createController('report_chooser_row', {title: L('General_GiveUsYourFeedback'), cid: 'feedback'}).getView());

    $.reportsTable.setData(rows);

    makeSureSelectedRowIsStillSelected();

    rows = null;
}

function setCurrentlySelectedCid(cidOfReport)
{
    cidToSelect = cidOfReport;
}

function makeSureSelectedRowIsStillSelected()
{
    if ($.reportsTable.selectRow && cidToSelect) {
        var index = 0;
        _.forEach($.reportsTable.data, function (section) {
            if (!section || !section.rows) {
                return;
            }
            
            _.forEach(section.rows, function (row) {
                if (cidToSelect == row.cid) {
                    $.reportsTable.selectRow(index);
                }

                index++;
            });
        });
    }

    rows = null;
}

function getCidOfEntryReport(reportsCollection)
{
    var entryReport = reportsCollection.getEntryReport();

    if (entryReport) {
        return entryReport.cid;
    }
}

function hideLeftSidebar()
{
    require('layout').hideLeftSidebar();
}

function isAnAccountSelected()
{
    return !!require('session').getAccount();
}

function isActionThatRequiresAnAccount(cid)
{
    var cidsWhichDontRequireAnAccount = ['settings', 'help', 'accounts', 'feedback'];

    return (-1 === cidsWhichDontRequireAnAccount.indexOf(cid));
}

function doSelectReport(event) 
{
    if (!event.rowData.cid) {
        return;
    }
    
    var cid = event.rowData.cid;

    if (!isAnAccountSelected() && isActionThatRequiresAnAccount(cid)) {
        cid = 'accounts';
    }

    setCurrentlySelectedCid(cid);

    hideLeftSidebar();

    require('layout').closeRecordedWindows();

    if ('live' == cid) {
        openLiveVisitors();
    } else if ('visitorlog' == cid) {
        openVisitorLog();
    } else if ('visitormap' == cid) {
        openVisitorMap();
    } else if ('settings' == cid) {
        openSettings();
    } else if ('help' == cid) {
        openHelp();
    } else if ('accounts' == cid) {
        chooseAccount();
    } else if ('feedback' == cid) {
        openGiveFeedback();
    } else {
        var report = reportsCollection.getByCid(cid);
        openCompositeReport(report);
    }
}

function openHelp()
{
    var help = Alloy.createController('help');
    help.open();
}

function openSettings()
{
    var settings = Alloy.createController('settings');
    settings.open();
}

function chooseAccount()
{
    var accounts = Alloy.createController('accounts');
    accounts.on('accountChosen', onAccountChosen);
    accounts.open();
}
 
function onAccountChosen(account)
{
    require('account').selectWebsite(account, function (siteModel, accountModel) {
        require('session').setWebsite(siteModel, accountModel);
    });

    this.off('accountChosen');
}

function onWebsiteSelected(siteModel, accountModel)
{
    openEntryReport();

    setCurrentlySelectedCid(getCidOfEntryReport(reportsCollection));
    makeSureSelectedRowIsStillSelected();
}

function openCompositeReport(chosenReportModel)
{
    var reportCategory = chosenReportModel.get('category');
    var statistics     = Alloy.createController('report_composite', {reportCategory: reportCategory});
    statistics.open();
}

function openLiveVisitors()
{
    var live = Alloy.createController('live_visitors');
    live.open();
}

function openVisitorLog()
{
    var log = Alloy.createController('visitor_log');
    log.open();
}

function openVisitorMap()
{
    var realtimemap = Alloy.createController('realtime_map');
    realtimemap.open();
}

function openGiveFeedback()
{
    var feedback = Alloy.createController('give_feedback');
    feedback.open();
}

function refresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    reportsCollection.fetchAllReports(accountModel, siteModel);
}

function openEntryReport()
{
    require('layout').closeRecordedWindows();

    var compositeReport = Alloy.createController('report_composite');
    compositeReport.open();
}

exports.open = function() 
{
    require('layout').setLeftSidebar($.reportsTable);
    require('layout').startRecordingWindows();

    require('session').on('websiteChanged', onWebsiteSelected);
    require('session').on('accountChanged', refresh);
    Alloy.createCollection('AppSettings').settings().on('change:language', refresh);

    openEntryReport();

    refresh();
};