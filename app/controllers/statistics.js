
var args = arguments[0] || {};

// a list of all available accounts
var accountsCollection = args.accounts || false;
// the currently selected account
var accountModel       = accountsCollection.first();
// the currently selected website
var siteModel          = Alloy.createModel('piwikEntrySite');
// A list of all available reports
var reportsCollection  = Alloy.createCollection('piwikReportsList');
// the currently selected report
var reportModel        = null;
// the fetched statistics that belongs to the currently selected report
var statisticsModel    = Alloy.createModel('piwikProcessedReport');
// an instance of the controller that displays the processed report 
var reportController   = null;

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
        Alloy.createController('accounts', {accounts: accountsCollection});
    });
    
    $.win1.leftNavButton = bar;
    
    var websitesButton = Ti.UI.createButton({image:'ic_action_website.png', width:32});
    websitesButton.addEventListener('click', function () {
        // TODO We should open list of available websites here, not list of available reports
        var reportList = Alloy.createController('reportslist', {reports: reportsCollection});
        reportList.open();
    });
    $.win1.rightNavButton = websitesButton;
}

accountsCollection.on('select', function (account) {
    accountModel = account;
    refresh();
});

reportsCollection.on('select', function (report) {
    console.log('se223');
    reportModel = report
    refresh();
});

statisticsModel.on('change', function (model) {
    if (reportController) {
        $.win1.remove(reportController.getView());
        reportController = null;
    }
    
    reportController = Alloy.createController('processedreport', {processedReport: model, account: accountModel});
    $.win1.add(reportController.getView());
});

siteModel.on('change', function (siteModel) {
    $.win1.title = siteModel.get('name');

    reportsCollection = Alloy.createCollection('piwikReportsList');
    reportsCollection.fetch({
        account: accountModel,
        params: {idSites: siteModel.id},
        success : function(model, reports) {

            reportModel = reportsCollection.getEntryReport();
           
            refresh();
            
        },
        error : function(model, resp) {
            console.log('Error 2');
        }
    });
});

siteModel.fetch({
    account: accountModel
});

function refresh() {
    console.log('refresh');

    var module = reportModel.get('module');
    var action = reportModel.get('action');
    
    statisticsModel.fetch({
        account: accountModel,
        params: {period: 'day', date: 'today', idSite: siteModel.id, apiModule: module, apiAction: action},
        error : function(model, resp) {
            console.log('Error 3');
        }
    });
}

exports.open = function () {
    $.index.open(); 
};
