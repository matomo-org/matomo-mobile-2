/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

$.titleLabel.text = args.title;
if (args.hasChild) {
    $.row.hasChild = true;
}