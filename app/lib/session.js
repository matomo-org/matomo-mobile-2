var Session = function () {

    var website = null;
    var account = null;
    var date    = null;

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

        setDate: function (dateModel) {
            date = dateModel;
            this.trigger('dateChanged', date);
        },
        getDate: function () {
            return date;
        },
    });
};

module.exports = new Session();