/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var Session = function () {

    var website = null;
    var account = null;
    var reportDate = null;

    var Alloy = require('alloy'); 

    Alloy._.extend(this, Alloy.Backbone.Events, {

        setWebsite: function (siteModel, accountModel) {
            this.setAccount(accountModel);

            website = siteModel;
            this.trigger('websiteChanged', website);
        },
        getWebsite: function () {
            return website;
        },

        setAccount: function (accountModel) {
            var oldAccount = account;
            account = accountModel;

            if (account && oldAccount && account.isSameAccount(oldAccount)) {
                return;
            }

            this.trigger('accountChanged', account);
        },
        getAccount: function () {
            return account;
        },

        setReportDate: function (reportDateModel) {
            reportDate = reportDateModel;
            this.trigger('reportDateChanged', reportDate);
        },
        getReportDate: function () {

            if (!reportDate) {
                console.warn('you need to fallback to default report date');
            }

            return reportDate;
        }
    });
};

module.exports = new Session();