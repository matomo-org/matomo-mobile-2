
$.rowsFilterLimit = Alloy.CFG.piwik.filterLimit;
$.showAllEntries  = false;

var shouldScrollToPositionOfPaginator = false;

function L(key)
{
    return require('L')(key);
}

exports.initLoadingMessage = function ()
{
    if (OS_IOS) {
        $.pullToRefresh.init($.reportTable);
    }
}

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loadingindicator.hide();
}

exports.showLoadingMessage = function ()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    }
    
    $.loadingindicator.show();
};

function onTogglePaginator()
{
    require('Piwik/Tracker').trackEvent({title: 'Toggle Paginator', url: '/report/with-dimension/toggle/paginator'});

    $.showAllEntries = !$.showAllEntries; 
    shouldScrollToPositionOfPaginator = $.showAllEntries;
    $.doRefresh();
}

function showReportHasNoData()
{
    var row = Ti.UI.createTableViewRow({
        height: Ti.UI.SIZE, 
        color: '#7e7e7e',
        title: L('CoreHome_ThereIsNoDataForThisReport')
    });

    $.reportTable.setData([row]);
}

function hasReportData(processedReportCollection) {
    return (processedReportCollection && processedReportCollection.length);
}

exports.renderProcessedReport = function (processedReportCollection)
{
    var accountModel = require('session').getAccount();
    
    showReportContent();

    $.reportTable.setData([]);

    if (!hasReportData(processedReportCollection)) {
        showReportHasNoData();
        return;
    }

    if ($.reportInfoCtrl) {
        $.reportInfoCtrl.update(processedReportCollection);
    }

    $.reportGraphCtrl.update(processedReportCollection, accountModel);

    var rows = [];

    var settings = Alloy.createCollection('AppSettings').settings();
    if (settings.areGraphsEnabled()) {
        var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
        if (OS_IOS) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
        }
        row.add($.reportGraphCtrl.getView());
        rows.push(row);
    }

    var row = Ti.UI.createTableViewRow({height: Ti.UI.SIZE});
    if (OS_IOS) {
        row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
    }
    row.add($.reportInfoCtrl.getView());
    rows.push(row);
    
    processedReportCollection.forEach(function (processedReport) {
        if (!processedReport) {
            return;
        }

        var hasSubtable = processedReportCollection.hasSubtable() && processedReport.getSubtableId();

        var reportRow = Alloy.createController('report_row', processedReport);

        var row = Ti.UI.createTableViewRow({
            height: Ti.UI.SIZE, 
            subtableId: processedReport.getSubtableId(),
            subtableAction: processedReportCollection.getActionToLoadSubTables(),
            subtableModule: processedReportCollection.getModule(),
            currentReportName: processedReportCollection.getReportName(),
            currentMetric: processedReport.getSortOrder(),
            reportTitle: processedReport.getTitle(),
            hasChild: hasSubtable
        });
        
        if (OS_IOS && !hasSubtable) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
        } else if (OS_IOS) {
            row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY;
        }

        if (hasSubtable) {
            row.addEventListener('click', function () {

                var params = {
                    backButtonTitle: this.currentReportName || L('Mobile_NavigationBack'),
                    apiModule: this.subtableModule, 
                    apiAction: this.subtableAction,
                    subtableId: this.subtableId,
                    metric: this.currentMetric,
                    reportTitle: this.reportTitle
                };
            
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
        var row = Ti.UI.createTableViewRow({color: '#336699', title: $.showAllEntries ? L('Mobile_ShowLess') : L('Mobile_ShowAll')});
        if (OS_MOBILEWEB) row.left = 10;
        
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
