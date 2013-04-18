exports.execute = function (callback)
{
    var params   = {openWebsiteAutomaticallyIfOnlyOneWebsiteIsAvailable: false};

    var websites = Alloy.createController('all_websites_dashboard', params);
    
    websites.on('websiteChosen', callback);
    websites.on('websiteChosen', function () {
        this.off('websiteChosen');
        this.close();
    });

    websites.open();
}