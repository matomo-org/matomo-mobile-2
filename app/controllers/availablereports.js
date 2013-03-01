function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var siteModel = args.site || false;
var reportsCollection = args.reports || false;
var closeOnSelect     = args.closeOnSelect || false;

reportsCollection.on('fetch', updateAvailableReportsList);

function updatePageTitle(siteModel)
{
    if ($.index) {
        $.index.title = siteModel.getName();
    }
}

function updateAvailableReportsList()
{
    if (!reportsCollection) {
        return;
    }
    
    var rows = [];
    var currentSection = null;
    var latestSection  = null;

    rows.push(Ti.UI.createTableViewRow({title: L('Live_VisitorsInRealTime'), cid: 'live', hasChild: true, ellipsize: false, wordWrap: true}));
    rows.push(Ti.UI.createTableViewRow({title: L('Live_VisitorLog'), cid: 'visitorlog', hasChild: true, ellipsize: false, wordWrap: true}));
    rows.push(Ti.UI.createTableViewRow({title: L('Real-time Map'), cid: 'visitormap', hasChild: true, ellipsize: false, wordWrap: true}));

    reportsCollection.forEach(function (report) 
    {
        if ('MultiSites_getOne' == report.get('uniqueId')) {
            // we do not display this report
            return;
        }

        currentSection = report.get('category');

        if (currentSection && currentSection !== latestSection) {

            section = Alloy.createWidget('org.piwik.tableviewsection', null, {title: String(currentSection)});
            rows.push(section.getSection());
            section = null;
        }

        latestSection  = currentSection;

        var reportName = report.get('name');
        rows.push(Ti.UI.createTableViewRow({title: reportName, cid: report.cid, hasChild: true, ellipsize: false, wordWrap: true}));
    });

    $.reportsTable.setData(rows);
    rows = null;
}

function doSelectReport(event) 
{
    var cid = event.rowData.cid;

    if ('live' == cid) {
        $.trigger('liveVisitorsChosen');
    } else if ('visitorlog' == cid) {
        $.trigger('visitorLogChosen');
    } else if ('visitormap' == cid) {
        $.trigger('visitorMapChosen');
    } else {
        var report = reportsCollection.getByCid(cid);
        $.trigger('reportChosen', report);
    }

    if (closeOnSelect) {
        close();
    }
}

function close()
{
    require('layout').close($.index);
    $.destroy();
}

exports.updateWebsite = function (siteModel) {
    updatePageTitle(siteModel);
}

exports.open = function() 
{
    updateAvailableReportsList();

    if (Alloy.isHandheld) {
        require('layout').open($.index);
    }
};