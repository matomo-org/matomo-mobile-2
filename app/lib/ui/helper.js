/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.getWidth = function (view) 
{
    if (!view) {
        console.warn('View not set, cannot detect width');
        return 0;
    }

    if (view.size && view.size.width) {
        return view.size.width;
    } else if (view.width) {
        return view.width;
    } else {
        console.warn('TODO NOT ABLE TO GET WIDTH');
    }

    return 0;
};

exports.getHeight = function (view) 
{
    if (!view) {
        console.warn('View not set, cannot detect height');
        return 0;
    }

    if (view.size && view.size.height) {
        return view.size.height;
    } else if (view.height) {
        return view.height;
    } else {
        console.warn('TODO NOT ABLE TO GET HEIGHT');
    }

    return 0;
};

function doesNotContainWhitespace (url) {
    return -1 == ('' + url).indexOf(' ');
}

exports.isTitaniumCompatibleImageUrl = function (url)
{
    return doesNotContainWhitespace(url);
};
