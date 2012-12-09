
var args = arguments[0] || {};
var accounts = args.accounts || false;
var account = accounts.first();

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
        Alloy.createController('accounts', {accounts: accounts});
    });
    
    $.win1.leftNavButton = bar;
    
    $.win1.rightNavButton = Ti.UI.createButton({image:'ic_action_website.png', width:32});
}

var siteModel = null;
var report    = null;

accounts.on('select', function (acc) {
    account = acc;
    refresh();
});

var statistics = Alloy.createModel('piwikProcessedReport');
var reportController = null;

function refresh() {
    console.log('refresh');
    
    statistics.fetch({
        account: account,
        params: {period: 'day', date: 'today', idSite: siteModel.id, apiModule: 'MultiSites', apiAction:'getAll'},
        error : function(model, resp) {
            console.log('Error 3');
        }
    });
}

statistics.on('change', function (model) {
    if (reportController) {
        $.win1.remove(reportController.getView());
        reportController = null;
    }
    
    reportController = Alloy.createController('processedreport', {processedReport: model, account: account});
    $.win1.add(reportController.getView());
})

var site = Alloy.createModel('piwikEntrySite');

site.on('change', function (siteModel) {
    $.win1.title = siteModel.get('name');
})

site.fetch({
    account: account,
    success : function(site) {
        siteModel = site;

        var reports = Alloy.createCollection('piwikReportsList');
        reports.fetch({
            account: account,
            params: {idSites: siteModel.id},
            success : function(model, reports) {
               
                refresh();
                
            },
            error : function(model, resp) {
                console.log('Error 2');
            }
        });
        
        
    },
    error : function(model, resp) {
        console.log('Error 1');
    }
});

exports.open = function () {
    $.index.open(); 
};
