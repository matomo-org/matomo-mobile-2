$.reloading = false;
$.pulling = false;
$.tableView = null;

function L(key)
{
    return require('L')(key);
}

function displayRefreshMessage()
{
    if ($.tableView) {
        $.tableView.setContentInsets({top: 60});
    }

    setStatusReloading();
}

function doRefresh()
{
    if ($.reloading) {
        // refresh is already in progress
        
        return;
    }
    
    $.reloading = true;
    $.pulling   = false;

    displayRefreshMessage();

    $.trigger('refresh');
}

function currentTime()
{
    return require('Piwik/Utils/Date').toLocaleTime(new Date());
}

function setStatusReloading()
{
    var now = currentTime();
    
    $.lastUpdatedLabel.text = String.format(L('Mobile_LastUpdated'), now);
    $.statusLabel.text      = L('Mobile_Reloading');
    
    $.arrow.hide();
    $.arrow.transform = Ti.UI.create2DMatrix();
    
    $.activityIndicator.show();
}

function setStatusReleaseToRefresh()
{
    var transform = Ti.UI.create2DMatrix();
    transform = transform.rotate(-180);
    $.pulling = true;

    $.arrow.animate({transform: transform, duration: 180});
    $.statusLabel.text = L('Mobile_ReleaseToRefresh');
}

function setStatusPullDownToRefresh()
{
    $.pulling = false;
    var transform = Ti.UI.create2DMatrix();

    $.arrow.animate({transform: transform, duration: 180});
    $.statusLabel.text = L('Mobile_PullDownToRefresh');
}

function onScrollTable(event)
{
    // fired each time the user scrolls within the tableview

    var offset = (event && event.contentOffset) ? event.contentOffset.y : 0;

    if (offset <= -65.0 && !$.pulling && !$.reloading) {
        setStatusReleaseToRefresh();

    } else if ($.pulling && !$.reloading && offset > -65.0 && offset < 0) {
        setStatusPullDownToRefresh();
    }
}

function onDragEnd()
{
    if ($.pulling && !$.reloading) {
        //  var refreshEvent = {title: 'Refresh Page',
        //                      url: '/refresh/ios-pull-to-refresh'};
        //  TODO ADD TRACKING

        // the user was pulling, no reloading is currently running, the user scrolled to the correct section
        doRefresh();
    }
}

exports.refresh = doRefresh;

exports.init = function (tableView)
{
    $.tableView = tableView;

    $.tableView.addEventListener('scroll', onScrollTable);

    $.tableView.addEventListener('dragEnd', onDragEnd);
};

exports.refreshDone = function () 
{
    $.reloading = false;

    if ($.tableView) {
        $.tableView.setContentInsets({top: 0});
    }
    
    if ($.statusLabel) {
        $.statusLabel.text = L('Mobile_PullDownToRefresh');
    }
    
    if ($.arrow) {
        $.arrow.show();
    }
    
    if ($.activityIndicator) {
        $.activityIndicator.hide();
    }
};