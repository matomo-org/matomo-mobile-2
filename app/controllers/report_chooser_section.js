/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

$.title.text = args.title;
delete args.title;

var params = _.omit(args, 'id', '__parentSymbol', '__itemTemplate', '$model');
if (!_.isEmpty(params)) {
    $.index.applyProperties(params);
}