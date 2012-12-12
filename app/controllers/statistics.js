
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

var currentMetric = null;
var flatten       = 0;

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
        var accounts = Alloy.createController('accounts', {accounts: accountsCollection});
        accounts.open();
    });
    
    $.win1.leftNavButton = bar;
    
    var websitesButton = Ti.UI.createButton({image:'ic_action_website.png', width:32});
    websitesButton.addEventListener('click', function () {
    });
    $.win1.rightNavButton = websitesButton;
}

function onChooseReport()
{
    var params     = {reports: reportsCollection};
    var reportList = Alloy.createController('reportslist', params);
    reportList.on('reportChosen', function (chosenReportModel) {
        reportModel   = chosenReportModel;
        currentMetric = null;
        refresh();
    })
    reportList.open();
}

function onChooseMetric()
{
    var params         = {metrics: statisticsModel.getMetrics()};
    var metricsChooser = Alloy.createController('reportmetricschooser', params);
    metricsChooser.on('metricChosen', function (chosenMetric) {
        currentMetric = chosenMetric;
        refresh();
    })
    metricsChooser.open();
}

function onChooseDate () 
{
    alert('change date');
}

function onFlatten () 
{
    flatten = 1;
    refresh();
    flatten = 0;
}

accountsCollection.on('select', function (account) {
    accountModel = account;
    refresh();
});

var reportRowsCtrl = null;
statisticsModel.on('refreshed', function (processedReportModel) {

    $.content.show();
    $.loading.hide();

    $.reportInfoCtrl.update(this);
    $.reportGraphCtrl.update(this, accountModel);

    if (reportRowsCtrl) {
        $.reportRowsContainer.remove(reportRowsCtrl.getView());
    }

    reportRowsCtrl = Alloy.createController('reportrows', {report: this});
    $.reportRowsContainer.add(reportRowsCtrl.getView());
});

statisticsModel.on('error', function () {
    // TODO what should we do in this case?
    $.content.show();
    $.loading.hide();
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
            statisticsModel.trigger('error', {type: 'loadingReportList'});
        }
    });
});

siteModel.fetch({
    account: accountModel
});

function refresh() {

    $.loading.show();
    $.content.hide();

    var module = reportModel.get('module');
    var action = reportModel.get('action');
    var metric = reportModel.getSortOrder(currentMetric);

    statisticsModel.setSortOrder(metric);
    
    statisticsModel.fetch({
        account: accountModel,
        params: {period: 'day', 
                 date: 'today', 
                 idSite: siteModel.id, 
                 flat: flatten,
                 sortOrderColumn: metric,
                 filter_sort_column: metric,
                 apiModule: module, 
                 apiAction: action},
        error: function () {
            statisticsModel.trigger('error', {type: 'loadingProcessedReport'});
        },
        success: function () {
            statisticsModel.trigger('refreshed');
        }
    });
}

exports.open = function () {
    $.index.open(); 
};
