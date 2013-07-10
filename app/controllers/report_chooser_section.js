/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

$.title.text = args.title;
delete args.title;

if (!_.isEmpty(args)) {
    $.index.applyProperties(args);
}
