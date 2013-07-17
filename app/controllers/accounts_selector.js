/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

exports.baseController = "accounts";

$.index.leftNavButton   = null;
$.index.backButtonTitle = L('Mobile_NavigationBack');

if (OS_ANDROID) {
    $.headerBar.off('homeIconItemSelected');
    $.headerBar.enableCanGoBack();
    $.headerBar.on('back', function () {
        $.close();
    });
}

$.showNoAccountSelectedHint = function ()
{
    // never dispay this hint here.
    return;
};