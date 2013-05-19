/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

$.reloading = false;
$.pulling   = false;
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

    displayRefreshMessage();

    $.trigger('refresh');
}

function currentTime()
{
    var moment = require('moment/moment');
    
    return moment().format('LT');
}

function setStatusReloading()
{
    $.reloading = true;
    $.pulling   = false;
    
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
        //  TODO ADD TRACKING

        // the user was pulling, no reloading is currently running, the user scrolled to the correct section
        doRefresh();
    }
}

exports.refresh = displayRefreshMessage;

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