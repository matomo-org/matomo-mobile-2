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
            account = accountModel;
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
            return reportDate;
        },
    });
};

module.exports = new Session();