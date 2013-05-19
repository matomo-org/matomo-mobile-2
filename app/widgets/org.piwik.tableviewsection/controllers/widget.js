/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

if (OS_IOS && args.style && 'native' == args.style) {

    exports.getSection = function () 
    {
        var params = {headerTitle: String(args.title)};

        return Ti.UI.createTableViewSection(params);
    }

} else {

    $.title.text = args.title || '';

    exports.getSection = function ()
    {
        return $.index;
    }
}