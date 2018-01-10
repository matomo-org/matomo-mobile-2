/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

$.title.text = args.title;
$.value.text = args.value;

if (args.hasChild) {
    $.index.hasChild = true;
}

if (args.selectable && OS_IOS) {
    $.row.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.GRAY;
}

exports.changeTitle = function (title)
{
    $.title.text = title;
}

exports.changeValue = function (value)
{
    $.value.text = value;
}