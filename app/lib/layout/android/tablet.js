/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var rootWin = Ti.UI.createWindow({
    backgroundColor: "#eff0f1",
    exitOnClose: true,
    windowSoftInputMode: Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN
});
rootWin.addEventListener('open', function(){
    rootWin.activity.actionBar.hide();
});
rootWin.open();

var AndroidLayout = require('layout/android');
var layout = new (AndroidLayout)(rootWin);

require('layout/window/recorder').apply(layout, []);
require('layout/android/sidebar/tablet').apply(layout, [rootWin]);

rootWin.addEventListener('androidback', function () {
    layout.closeCurrentWindow();
});

module.exports = layout;