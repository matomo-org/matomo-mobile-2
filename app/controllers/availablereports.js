var args = arguments[0] || {};

function updatePageTitle(siteModel)
{
    if (siteModel) {
        $.index.title = siteModel.getName();
    }
}

function updateAvailableReportsList(reportsCollection)
{
    if (!reportsCollection) {
        return;
    }
    
    var rows = [];
    var currentSection = null;
    var latestSection  = null;

    reportsCollection.map(function (report) 
    {
        if ('MultiSites_getOne' == report.get('uniqueId')) {
            // we do not display this report
            return;
        }

        currentSection = report.get('category');

        if (currentSection && currentSection !== latestSection) {
            section = Ti.UI.createTableViewSection({headerTitle: String(currentSection)});
            rows.push(section);
            section = null;
        }

        latestSection  = currentSection;

        var reportName = report.get('name');
        rows.push(Ti.UI.createTableViewRow({title: reportName, cid: report.cid}));
    });

    $.reportsTable.setData(rows);
    rows = null;
}

function doSelectReport(event) 
{
    var cid    = event.rowData.cid;
    var report = reportsCollection.getByCid(cid);

    $.trigger('reportChosen', report);
    close();
}

function close()
{
    require('alloy').Globals.layout.close($.index);
}

exports.updateReports = function(reportsCollection, siteModel) 
{
    updatePageTitle(siteModel);
    updateAvailableReportsList(reportsCollection);
}

exports.open = function() 
{
    var siteModel = args.site || false;
    var reportCollection = args.reports || false;
    exports.updateReports(reportCollection, siteModel);

    require('alloy').Globals.layout.open($.index);
};