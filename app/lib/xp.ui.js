/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.createWindow = function(args) {
    return Ti.UI[OS_ANDROID ? 'createView' : 'createWindow'](args);
};