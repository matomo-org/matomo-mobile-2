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

function setTitle(title)
{
    $.title.text = title + '';
}

function setMessage(message)
{
    $.message.text = message + '';
}

exports.show = function (options) {

    if (options && _.isString(options.title)) {
        setTitle(options.title);
    }

    if (options && _.isString(options.message)) {
        setMessage(options.message);
    }

    $.index.show();
};

exports.hide = function () {
    $.index.hide();
};