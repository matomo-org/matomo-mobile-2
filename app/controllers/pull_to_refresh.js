/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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
            tintColor: '#CD1628'
        });
        
        $.tableView.refreshControl.addEventListener('refreshstart', function () {
            if (!$.reloading) {
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
    }
    
    $.reloading = false;
};