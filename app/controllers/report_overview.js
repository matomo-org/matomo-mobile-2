/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

// !!$model.get('constantRowsCount') || 
if ('get' == $model.get('action')) {
    exports = Alloy.createController('report_overview_without_dimension', arguments[0]);
} else {
    exports = Alloy.createController('report_overview_with_dimension', arguments[0]);
}