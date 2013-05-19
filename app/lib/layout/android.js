/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var openedWindows = [];

function hasOpenedWindow()
{
    return !!openedWindows.length;
}
function getCurrentlyOpenedWindow()
{
    return openedWindows[openedWindows.length - 1];
}

function closeCurrentlyOpenedWindow()
{
    if (hasOpenedWindow()) {
        exports.close(getCurrentlyOpenedWindow());
    }
}

exports.close = function(win) {
    
    var _ = require('alloy/underscore');
    openedWindows = _.without(openedWindows, win);

    win.close();
    win = null;
};

exports.open = function(win) {
    win.addEventListener('androidback', closeCurrentlyOpenedWindow);
    win.open();
    openedWindows.push(win);
    win = null;
};
