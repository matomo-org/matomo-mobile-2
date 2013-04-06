function L(key)
{
    return require('L')(key);
}

var args         = arguments[0] || {};
var flatten      = args.flatten || 0;
var reportList   = args.reportList || {};
var reportPeriod = args.period || 'day';
var reportDate   = args.date || 'today';

var module = $model.get('module');
var action = $model.get('action');
var metric = $model.getSortOrder();
var accountModel = $model.accountModel;
var siteModel    = $model.siteModel;


var statisticsCollection = Alloy.createCollection('piwikProcessedReport');

function openReport()
{
    var params = {account: accountModel, site: siteModel, report: $model};
    var report = Alloy.createController('report', params);
    report.open();
}

var __alloyId54 = function(e) {
    var models = statisticsCollection.models, children = $.content.children;
    for (var d = children.length - 1; d >= 0; d--) $.content.remove(children[d]);
    len = models.length;
    for (var i = 0; i < len; i++) {
        var __alloyId88 = models[i];
        __alloyId88.__transform = {};
        var __alloyId90 = Ti.UI.createView({
            height: Ti.UI.SIZE,
            id: "__alloyId89"
        });
        $.content.add(__alloyId90);
        var __alloyId92 = Ti.UI.createLabel({
            color: "#333333",
            text: "ROW",
            id: "__alloyId91"
        });
        __alloyId90.add(__alloyId92);
    }
};

statisticsCollection.on("fetch destroy change add remove reset", __alloyId54);
exports.destroy = function() {
    statisticsCollection.off("fetch destroy change add remove reset", __alloyId54);
};

statisticsCollection.fetch({
    account: accountModel,
    params: {period: reportPeriod, 
             date: reportDate, 
             idSite: siteModel.id, 
             flat: flatten,
             sortOrderColumn: metric,
             filter_sort_column: metric,
             filter_limit: 4,
             apiModule: module, 
             apiAction: action}
});