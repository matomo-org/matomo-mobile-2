if (OS_IOS) {
    var leftButtons = [
        {image:'ic_action_settings.png', width:32},
        {image:'ic_action_accounts.png', width:32}
    ];
    var bar = Ti.UI.createButtonBar({
        labels: leftButtons,
        backgroundColor: "#B2AEA5"
    });
    
    bar.addEventListener('click', function () {
        Alloy.createController('accounts');
    });
    
    $.win1.leftNavButton = bar;
    
    $.win1.rightNavButton = Ti.UI.createButton({image:'ic_action_website.png', width:32});
}

$.index.open();

var site   = null;
var report = null;

var AppAccounts = require("Piwik/App/Accounts");
// TODO we need a central storage for current selected account
var accounts    = new AppAccounts().getAccounts();

// TODO create a Backbone.js Sync Adapter for API Requests.
// fetch first website
var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');
var sitesRequest    = new PiwikApiRequest();
sitesRequest.setMethod('SitesManager.getSitesWithAtLeastViewAccess');
sitesRequest.setParameter({accountId: accounts[0].id, limit: 1});
sitesRequest.setAccount(accounts[0]);
sitesRequest.setCallback(this, function (response) {
    site = response[0];
    
    
    var reportsRequest  = new PiwikApiRequest();
    reportsRequest.setMethod('API.getReportMetadata');
    reportsRequest.setParameter({accountId: accounts[0].id, showSubtableReports: 0, hideMetricsDoc: 1, idSites: site.idsite});
    reportsRequest.setAccount(accounts[0]);
    reportsRequest.setCallback(this, function (reports) {
        var reports = response;
        
        // TODO Detect if all websites dashboard is available
        
        var statisticsRequest  = new PiwikApiRequest();
        statisticsRequest.setMethod('API.getProcessedReport');
        statisticsRequest.setParameter({accountId: accounts[0].id, period: 'day', date: 'today', hideMetricsDoc: 1, showTimer: 0, idSite: site.idsite, apiModule: 'MultiSites', apiAction:'getAll'});
        statisticsRequest.setAccount(accounts[0]);
        statisticsRequest.setCallback(this, function (processedReport) {
            alert(processedReport);
        });
        statisticsRequest.send();
    });
    
    reportsRequest.send();
    
    
    
});
sitesRequest.send();



// fetch list of reports


// fetch report data
