exports.execute = function (callback)
{
    var params   = {openWebsiteAutomaticallyIfOnlyOneWebsiteIsAvailable: false};

    var websites = Alloy.createController('allwebsitesdashboard', params);
    
    websites.on('websiteChosen', callback);
    websites.on('websiteChosen', function () {
        this.off('websiteChosen');
        this.close();
    });

    websites.open();
}