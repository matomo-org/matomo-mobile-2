/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var chooser = null;

exports.toggleVisibility = function ()
{
    if (!chooser) {
        chooser = Alloy.createController('report_chooser');
        chooser.open();
    }

    require('layout').toggleLeftSidebar();
};