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


var site = Alloy.createCollection('piwikEntrySite');
site.fetch({
    success : function(model, sites) {
        site = sites[0];
        
        
        
        var reports = Alloy.createCollection('piwikReportsList');
        reports.fetch({
            params: {idSites: site.idsite},
            success : function(model, reports) {
               
                // model.getEntryReport(reports);
                
                var statistics = Alloy.createCollection('piwikProcessedReport');
                statistics.fetch({
                    params: {period: 'day', date: 'today', idSite: site.idsite, apiModule: 'MultiSites', apiAction:'getAll'},
                    success : function(model, processedReport) {
                        alert(processedReport);
                    },
                    error : function(model, resp) {
                        alert('Error 3');
                    }
                });
                    
               
            },
            error : function(model, resp) {
                alert('Error 2');
            }
        });
        
        
    },
    error : function(model, resp) {
        alert('Error 1');
    }
});



// fetch list of reports


// fetch report data
