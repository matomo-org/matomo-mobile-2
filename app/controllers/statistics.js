
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

var site   = null;
var report = null;

var site = Alloy.createModel('piwikEntrySite');
site.fetch({
    account: account,
    success : function(siteModel) {

        var reports = Alloy.createCollection('piwikReportsList');
        reports.fetch({
            account: account,
            params: {idSites: siteModel.id},
            success : function(model, reports) {
               
                // model.getEntryReport(reports);
                
                var statistics = Alloy.createCollection('piwikProcessedReport');
                statistics.fetch({
                    account: account,
                    params: {period: 'day', date: 'today', idSite: siteModel.id, apiModule: 'MultiSites', apiAction:'getAll'},
                    success : function(model, processedReport) {
                        console.log(processedReport);
                    },
                    error : function(model, resp) {
                        console.log('Error 3');
                    }
                });
                    
               
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
// fetch list of reports


// fetch report data
