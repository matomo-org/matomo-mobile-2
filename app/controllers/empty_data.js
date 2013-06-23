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

function refresh()
{
    $.trigger('refresh');
}

exports.show = function (message) {
    $.index.show();

    if (_.isString(message)) {
        $.message.text = message;
    }
};

exports.hide = function () {
    $.index.hide();
};