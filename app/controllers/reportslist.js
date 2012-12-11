var args = arguments[0] || {};
var reportsCollection = args.reports || false;

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

function doSelectReport (event) 
{
    var cid    = event.rowData.cid;
    var report = reportsCollection.getByCid(cid);

    $.trigger('chosenReport', report);

    $.index.close();
}

exports.open = function () 
{
    $.index.open();
};