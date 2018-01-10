/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

if (args.title && args.description) {

    exports.create = function ()
    {
        return Alloy.createWidget('org.piwik.tableviewrow', 'title_description', args);
    };

    exports.getRow = function ()
    {
        return exports.create().getView();
    };

} else if (args.title && args.value) {

    exports.create = function ()
    {
        return Alloy.createWidget('org.piwik.tableviewrow', 'title_value', args);
    };

    exports.getRow = function ()
    {
        return exports.create().getView();
    };

} else if (args.title) {

    exports.create = function ()
    {
        return Alloy.createWidget('org.piwik.tableviewrow', 'title', args);
    };

    exports.getRow = function ()
    {
        return exports.create().getView();
    };

}