/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

// see #4064 http://dev.piwik.org/trac/ticket/4064
var isOpened = false;

function openAllWebsitesDashboard(onWebsiteChosenCallback) {

    var websites = Alloy.createController('all_websites_dashboard', {enableGoBack: true});
    websites.enableCanGoBack();

    if (onWebsiteChosenCallback) {
        websites.on('websiteChosen', onWebsiteChosenCallback);
    }

    websites.on('close', function () {
        isOpened = false;
    });

    websites.on('websiteChosen', function () {
        this.off('websiteChosen');
        this.close();
    });

    websites.open();
}

exports.execute = function (callback)
{
    if (isOpened) {
        return;
    }

    isOpened = true;

    openAllWebsitesDashboard(callback);
};