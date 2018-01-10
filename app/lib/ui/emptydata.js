/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function EmptyData()
{
    this.controller = null;
}

EmptyData.prototype.show = function (parentUiWidget, onRefresh, title, message) {
    this.cleanupIfNeeded();

    this.controller = Alloy.createController('empty_data', {title: title, message: message});
    this.controller.on('refresh', onRefresh);
    this.controller.setParent(parentUiWidget);
};

EmptyData.prototype.cleanupIfNeeded = function () {

    if (this.controller && this.controller.parent) {
        this.controller.parent.remove(this.controller.getView());
    } else if (this.controller) {
        console.warn('there is no parent UI widget in empty data controller');
    }

    if (this.controller) {
        this.controller.close();
        this.controller = null;
    }
};

module.exports = EmptyData;