
$.rowsFilterLimit = Alloy.CFG.piwik.filterLimit;
$.showAllEntries  = false;
exports.emptyData = new (require('ui/emptydata'));

var shouldScrollToPositionOfPaginator = false;


var args = arguments[0] || {};
var reportModel  = args.report;

function L(key)
{
    return require('L')(key);
}

exports.initLoadingMessage = function ()
{
    if (OS_IOS) {
        $.pullToRefresh.init($.reportTable);
    }
};

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.content.show();
    $.loadingindicator.hide();
    $.emptyData && $.emptyData.cleanupIfNeeded();
}

exports.showReportHasNoData = function (title, message)
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.emptyData.show($.index, $.doRefresh, title, message);

    $.content.hide();
    $.content.visible = false;
    $.loadingindicator.hide();
};

exports.showLoadingMessage = function ()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    }
    
    $.loadingindicator.show();
    $.content.hide();
    $.emptyData && $.emptyData.cleanupIfNeeded();
};

function onTogglePaginator()
{
    require('Piwik/Tracker').trackEvent({name: 'Toggle Paginator', category: 'Report With Dimension'});

    $.showAllEntries = !$.showAllEntries; 
    shouldScrollToPositionOfPaginator = $.showAllEntries;
    $.doRefresh();
}

function hasReportData(processedReportCollection) {
    return (processedReportCollection && processedReportCollection.length);
}

exports.renderProcessedReport = function (processedReportCollection)
{
    showReportContent();

    $.reportTable.setData([]);

    if (!hasReportData(processedReportCollection)) {
        exports.showReportHasNoData(L('Mobile_NoDataShort'), L('CoreHome_ThereIsNoDataForThisReport'));
        return;
    }

    if ($.reportInfoCtrl) {
        $.reportInfoCtrl.update(processedReportCollection);
    }

    var accountModel = require('session').getAccount();

    if ($.reportGraphCtrl) {
        $.reportGraphCtrl.update(processedReportCollection, accountModel);
    }

    var rows = [];

    var settings = Alloy.createCollection('AppSettings').settings();
    if (settings.areGraphsEnabled() && $.reportGraphCtrl) {
        var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
        if (OS_IOS) {
            row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
        }
        row.add($.reportGraphCtrl.getView());
        rows.push(row);
    }

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
    }
    row.add($.reportInfoCtrl.getView());
    rows.push(row);
    
    processedReportCollection.forEach(function (processedReport) {
        if (!processedReport) {
            return;
        }

        var hasSubtable = processedReportCollection.hasSubtable() && processedReport.getSubtableId();

        var reportRow = Alloy.createController('report_row', processedReport);

        var rowOptions = {
            height: Ti.UI.SIZE,
            subtableId: processedReport.getSubtableId(),
            subtableAction: processedReportCollection.getActionToLoadSubTables(),
            subtableModule: processedReportCollection.getModule(),
            currentReportName: processedReportCollection.getReportName(),
            currentMetric: processedReport.getSortOrder(),
            reportTitle: processedReport.getTitle()
        };

        if (OS_ANDROID && Boolean(hasSubtable)) {
            rowOptions.rightImage = '/images/navigation_next_item.png';
        } else if (Boolean(hasSubtable)) {
            rowOptions.hasChild = true;
        }

        if (OS_IOS && !Boolean(hasSubtable)) {
            rowOptions.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
        } else if (OS_IOS) {
            rowOptions.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
        }

        var row = Ti.UI.createTableViewRow(rowOptions);

        if (hasSubtable) {
            row.addEventListener('click', function () {

                var params = {
                    backButtonTitle: this.currentReportName || L('Mobile_NavigationBack'),
                    apiModule: this.subtableModule, 
                    apiAction: this.subtableAction,
                    subtableId: this.subtableId,
                    metric: this.currentMetric,
                    reportTitle: this.reportTitle,
                    reportModel: reportModel,
                    report: reportModel
                };

                // TODO add possible report params (eg needed by goals)

                var subtableReport = Alloy.createController('report_subtable', params);
                subtableReport.open();
            });
        }

        row.add(reportRow.getView());
        rows.push(row);
        row = null;
    });

    if ($.rowsFilterLimit <= processedReportCollection.length) {
        // a show all or show less button only makes sense if there are more or equal results than the used
        // filter limit value...
        var showAllOptions = {color: '#43a047', title: $.showAllEntries ? L('Mobile_ShowLess') : L('Mobile_ShowAll')};
        if (OS_MOBILEWEB) showAllOptions.left = 10;
        if (OS_ANDROID) showAllOptions.leftImage = '/images/spacer_10x10.png';
        if (OS_ANDROID) showAllOptions.font = {fontSize: '16sp', fontWeight: 'bold'};
        if (OS_ANDROID) showAllOptions.top = '16dp';
        if (OS_ANDROID) showAllOptions.bottom = '16dp';

        if (OS_IOS) {
            showAllOptions.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
        } else {
            showAllOptions.backgroundSelectedColor = '#a9a9a9';
        }

        var row = Ti.UI.createTableViewRow(showAllOptions);
        row.addEventListener('click', onTogglePaginator);
        rows.push(row);
    }
    
    $.reportTable.setData(rows);
    row  = null;
    rows = null;

    if (shouldScrollToPositionOfPaginator) {
        $.reportTable.scrollToIndex($.rowsFilterLimit);
        shouldScrollToPositionOfPaginator = false;
    }
};
