/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.execute = function (callback)
{
    var params   = {openWebsiteAutomaticallyIfOnlyOneWebsiteIsAvailable: false};

    var websites = Alloy.createController('all_websites_dashboard', params);
    
    if (callback) {
        websites.on('websiteChosen', callback);
    }

    websites.on('websiteChosen', function () {
        this.off('websiteChosen');
        this.close();
    });

    websites.open();
};