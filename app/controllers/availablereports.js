var args = arguments[0] || {};
var siteModel = args.site || false;
var reportsCollection = args.reports || false;

reportsCollection.on('fetch', updateAvailableReportsList);

function updatePageTitle(siteModel)
{
    $.index.title = siteModel.getName();
}

function updateAvailableReportsList()
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

    if (require('alloy').isHandheld) {
        close();
    }
}

function close()
{
    require('alloy').Globals.layout.close($.index);
}

exports.siteChosen = updatePageTitle;

exports.open = function() 
{
    if (siteModel) {
        updatePageTitle(siteModel);
    }

    updateAvailableReportsList();

    require('alloy').Globals.layout.open($.index);
};