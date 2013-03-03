function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var siteModel = args.site || false;
var reportsCollection = args.reports || false;
var closeOnSelect     = args.closeOnSelect || false;

reportsCollection.on('fetch', updateAvailableReportsList);


function updateAvailableReportsList()
{
    if (!reportsCollection) {
        return;
    }
    
    var rows = [];
    var currentSection = null;
    var latestSection  = null;

    rows.push(Alloy.createController('availablereportrow', {title: L('Real-time Map'), cid: 'visitormap'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Live_VisitorsInRealTime'), cid: 'live'}).getView());
    rows.push(Alloy.createController('availablereportrow', {title: L('Live_VisitorLog'), cid: 'visitorlog'}).getView());

    reportsCollection.forEach(function (report) 
    {
        if ('MultiSites_getOne' == report.get('uniqueId')) {
            // we do not display this report
            return;
        }

        currentSection = report.get('category');

        if (currentSection && currentSection !== latestSection) {
            rows.push(Alloy.createController('availablereportsection', {title: String(currentSection)}).getView());
        }

        latestSection  = currentSection;

        var reportName = report.get('name');
        rows.push(Alloy.createController('availablereportrow', {title: reportName, cid: report.cid}).getView());
    });

    $.reportsTable.setData(rows);
    rows = null;
}

function doSelectReport(event) 
{
    if (!event.rowData.cid) {
        return;
    }
    
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

exports.updateWebsite = function (newSiteModel) {
    siteModel = newSiteModel
}

exports.open = function() 
{
    updateAvailableReportsList();

    if (Alloy.isHandheld) {
        require('layout').open($.index);
    }
};