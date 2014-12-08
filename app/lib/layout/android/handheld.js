/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var rootWin = Ti.UI.createWindow({backgroundColor: "#e5e5e5", exitOnClose: true});
rootWin.addEventListener('open', function(){
    rootWin.activity.actionBar.hide();
});
rootWin.open();

var AndroidLayout = require('layout/android');
var layout = new (AndroidLayout)(rootWin);

require('layout/window/recorder').apply(layout, []);
require('layout/android/sidebar/handheld').apply(layout, []);

var aboutToExitApp = false;

rootWin.addEventListener('androidback', function () {

    if (2 === layout.getNumRecordedWindows()
        && layout.isLeftSidebarVisible()
        && aboutToExitApp) {
        layout.closeRecordedWindows(); // exit app
    } else if (1 === layout.getNumRecordedWindows()
        && layout.hasLeftSidebar()
        && !layout.isLeftSidebarVisible()) {

        aboutToExitApp = true;

        layout.showLeftSidebar(function () {
            aboutToExitApp = false;
        });
        // before closing the last opened window we want to open the left sidebar.
        // if the user presses back one more time we will close the app

    } else {
        aboutToExitApp = false;
        layout.closeCurrentWindow();
    }
});

module.exports = layout;