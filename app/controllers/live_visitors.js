function L(key)
{
    return require('L')(key);
}

var refreshIntervalInMs = 45000;

$.countdown.init(parseInt(refreshIntervalInMs / 1000));

var piwikLiveVisitors = Alloy.createCollection('piwikLiveVisitors');

if (OS_IOS) {
    $.pullToRefresh.init($.liveTable);
}

function registerEvents()
{
    var session = require('session');
    session.on('websiteChanged', doRefresh);
}

function unregisterEvents()
{
    var session = require('session');
    session.off('websiteChanged', doRefresh);
}

function onClose()
{
    unregisterEvents();
    $.destroy();
}

var refreshTimer = null;
var stopRefreshTimer = function () {

    if (refreshTimer) {
        // do no longer execute autoRefresh if user opens another app or returns the home screen (only for iOS)
        clearTimeout(refreshTimer);
    }
    
    $.countdown.stop();
};

var startRefreshTimer = function (timeoutInMs) {
    stopRefreshTimer();

    $.countdown.init(parseInt(timeoutInMs / 1000));
    $.countdown.start();

    refreshTimer = setTimeout(function () {
        if (doRefresh) {
            doRefresh();
        }
    }, timeoutInMs);
}

function openVisitor(event)
{
    if (!event || !event.row || !event.row.visitor) {
        return;
    }

    var params  = {visitor: event.row.visitor};
    var visitor = Alloy.createController('visitor', params);
    visitor.open();
}

function render(account, counter30Min, counter24Hours, visitorDetails)
{
    showReportContent();

    var rows = [];

    counter30Min.title = String.format(L('Live_LastMinutes'), '30');
    var last30minutes = Alloy.createController('live_counter', counter30Min);
    rows.push(last30minutes.getView());

    counter24Hours.title = String.format(L('Live_LastHours'), '24');
    var last24hours = Alloy.createController('live_counter', counter24Hours);
    rows.push(last24hours.getView());

    _.forEach(visitorDetails, function (visitorDetail) {
        var params = {account: account, visitor: visitorDetail};
        var visitorOverview = Alloy.createController('visitor_overview', params);
        var visitorRow = visitorOverview.getView()
        visitorRow.visitor = visitorDetail;
        rows.push(visitorRow);
        visitorRow = null;
    });

    $.liveTable.setData(rows);
    rows = null;

    startRefreshTimer(refreshIntervalInMs);
}

function showReportContent()
{
    if (OS_IOS) {
        $.pullToRefresh.refreshDone();
    } 

    $.loadingindicator.hide();
}

function showLoadingMessage()
{
    if (OS_IOS) {
        $.pullToRefresh.refresh();
    } 

    $.loadingindicator.show();
    stopRefreshTimer();
}

function onFetchError()
{
    console.log('error fetching data');
}

function doRefresh()
{
    var accountModel = require('session').getAccount();
    var siteModel    = require('session').getWebsite();

    showLoadingMessage();
    piwikLiveVisitors.fetchVisitors(accountModel, siteModel.id, render, onFetchError);
}

/***** HANDLE BACKGROUND EVENTS ******/
    /*
    this.addEventListener('closeWindow', function () {
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
    });

    this.addEventListener('blurWindow', function () {
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
    });

    this.addEventListener('focusWindow', function () {
        if (params && params.autoRefresh && tableView && tableView.data && tableView.data.length && that) {
            // start auto refresh again if user returns to this window from a previous displayed window
            
            startRefreshTimer(20000);
        }
    });
    */
    
    var onResume = function () {
        if ($.liveTable && $.liveTable.data && $.liveTable.data.length) {

            startRefreshTimer(3000);
        }
    };
    
    var onPause = function () {
        if (stopRefreshTimer) {
            stopRefreshTimer();
        }
    }
    
    // ios
    Ti.App.addEventListener('resume', onResume);
    Ti.App.addEventListener('pause', onPause);

    var activity = null;
    
    // get activity on android
    if (Ti.Android && Ti.Android.currentActivity) {
        activity = Ti.Android.currentActivity;
    } else if (!activity && Ti.UI.currentWindow && Ti.UI.currentWindow.activity) {
        activity = Ti.UI.currentWindow.activity;
    } else if (!activity && $.index && $.index.activity) {
        activity = $.indexactivity;
    }

    // android
    if (activity) {
        activity.addEventListener('pause', stopRefreshTimer);
        activity.addEventListener('stop', stopRefreshTimer);
    }

/***** HANDLE BACKGROUND EVENTS END ******/

function toggleReportChooserVisibility(event)
{
    require('report/chooser').toggleVisibility();
}

exports.open = function () 
{
    registerEvents();
    doRefresh();
    require('layout').open($.index);
}

function close()
{
    require('layout').close($.index);
}

exports.close   = close;
exports.refresh = doRefresh;