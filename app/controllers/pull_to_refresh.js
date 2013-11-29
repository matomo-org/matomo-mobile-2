/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

$.reloading = false;
$.tableView = null;

function L(key)
{
    return require('L')(key);
}

exports.refresh = function () 
{
    if ($.tableView.refreshControl) {
        $.tableView.refreshControl.beginRefreshing();
    }
};

exports.init = function (tableView)
{
    $.tableView = tableView;

    if (OS_IOS) {
        $.tableView.refreshControl = Ti.UI.createRefreshControl({
            tintColor: '#CD1628',
            title: Ti.UI.iOS.createAttributedString({
                text: L('Mobile_PullDownToRefresh')
            })
        });
        
        $.tableView.refreshControl.addEventListener('refreshstart', function () {
            if (!$.reloading) {
                $.tableView.refreshControl.title = Ti.UI.iOS.createAttributedString({
                    text: L('Mobile_Reloading')
                });
                $.reloading = true;
                $.trigger('refresh');
            }
        });
    }
};

exports.refreshDone = function () 
{
    if ($.tableView.refreshControl) {
        $.tableView.refreshControl.endRefreshing();
        $.tableView.refreshControl.title = Ti.UI.iOS.createAttributedString({
            text: L('Mobile_PullDownToRefresh')
        });
    }
    
    $.reloading = false;
};