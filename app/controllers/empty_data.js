/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

if (args && _.isString(args.title)) {
    $.title.text = args.title;
} else {
    $.title.text = L('Mobile_NoDataShort');
}

if (args && _.isString(args.message)) {
    $.message.text = args.message;
}

function refresh()
{
    $.trigger('refresh');
}

exports.close = function () {
    $.off();
    $.destroy();
};