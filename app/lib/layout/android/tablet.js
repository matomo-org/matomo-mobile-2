/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var AndroidLayout = require('layout/android');
var layout = new (AndroidLayout)();

var rootWin = Ti.UI.createWindow({backgroundColor: "#e5e5e5"});
rootWin.addEventListener('open', function(){
    rootWin.activity.actionBar.hide();
});
rootWin.open();

require('layout/window/recorder').apply(layout, []);
require('layout/android/sidebar/tablet').apply(layout, []);

module.exports = layout;