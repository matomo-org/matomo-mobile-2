/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

/**
 * Matomo - Web Analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * Whether the user wants to be reminded after the next 40th app start. If this is false, we should make sure
 * that the user will not be asked to rate the app.
 *
 * @defaults  false
 * 
 * @type      boolean
 * 
 * @private
 */
var remindMe    = true;

/**
 * Holds the number of app launches since the user installed the app.
 *
 * @defaults  1
 *
 * @type      number
 * 
 * @private
 */
var numLaunches = 1;

/**
 * @class    Displays a dialog after every 40th app start to ask the user whether he wants to rate the app in 
 *           Google Play or Apple App Store. The user has the possibility to choose a button "Don't remind me". 
 *           In such a case the user won't see the dialog again. The other two options are "Rate now" and "Not now".
 *           If the user chooses "Rate now", we'll also no longer ask whether he wants to rate the app.
 *
 * @example
 * var rating = require('Rating');
 * rating.countLaunch();
 */
function Rating () {

}

function getTracker()
{
    return require('Piwik/Tracker');
}

/**
 * Increases the launch counter by one and asks the user to rate the app on every 40th launch.
 */
Rating.prototype.countLaunch = function () {
    if (!this.canRate()) {

        return;
    }
    
    var rating = Ti.App.Properties.getString('appstore_rating', '');
    
    if (rating) {
        rating      = JSON.parse(rating);
        
        numLaunches = rating.numLaunches + 1;
        remindMe    = rating.remindMe;
        rating      = null;
    }

    this.store();
    
    if (0 == (numLaunches % 40)) {
        this.askUserToRate();
    }
};

/**
 * Stores (beyond application session) the current number of app launches and whether the user wants to be reminded.
 */
Rating.prototype.store = function () {
    var rating = JSON.stringify({numLaunches: numLaunches, remindMe: remindMe});
    
    Ti.App.Properties.setString('appstore_rating', rating);
};

/**
 * Asks the user to rate the app. Therefore it opens a dialog where the user has three options: "Rate now", "Not now"
 * and "Don't remind me". It'll ask the user only if device and platform supports the rating of the app. 
 * The dialog won't open if the user has pressed the "Don't remind me" button before.
 */
Rating.prototype.askUserToRate = function () {
        
    if (!remindMe) {
        // user pressed the button "don't remind me" before
        
        return;
    }
    
    if (!this.canRate()) {
        // platform or device does not support the rating of the app
        
        return;
    }

    var L       = require('L');
    var message = String.format(L('Mobile_RatingPleaseRateUs'), this.getStoreName(), 'mobile@matomo.org');
    var buttons = [L('Mobile_RatingNow'), L('Mobile_RatingNotNow'), L('Mobile_RatingDontRemindMe')];
    L           = null;
    
    var dialog  = Ti.UI.createAlertDialog({message: message, 
                                           buttonNames: buttons,
                                           cancel: 2});

    var that    = this;
    dialog.addEventListener('click', function (event) {
        if (!event || true === event.cancel || event.cancel === event.index) {
            // user pressed the "Don't remind me" button
            remindMe = false;
            
            getTracker().trackEvent({name: 'Dont remind me', category: 'Rating'});

        } else if (0 == event.index) {
            remindMe = false;

            that.rate();
            
            getTracker().trackEvent({name: 'Rate now', category: 'Rating'});
        
        } else if (1 == event.index) {
            getTracker().trackEvent({name: 'Rate not now', category: 'Rating'});
        }
        
        that.store();
        that = null;
    });
    
    dialog.show();
};

/**
 * Returns the name of the app store depending on the current platform.
 *
 * @type  string
 */
Rating.prototype.getStoreName = function () {
    
    var storeName = '';
    
    if (OS_ANDROID) {

        storeName = 'Google Play Store';

    } else if (OS_IOS) {

        storeName = 'App Store';
    }
    
    return storeName;
};

/**
 * Returns the url to the app store depending on the current platform. If no url is returned, the current platform
 * or device doesn't support app rating.
 *
 * @type  string
 */
Rating.prototype.getStoreUrl = function () {

    if (OS_ANDROID) {
        // @todo what if android market isn't installed?

        return 'market://details?id=' + Ti.App.id;

    } else if (OS_IOS) {

        var appStore = require('alloy').CFG.appleAppStore;
        
        if (!appStore || !appStore.appId) {
            // no app store id configured.
            
            return '';
        }

        var url = 'itms-apps://itunes.apple.com/app/id';
        url     = url + appStore.appId;
        
        if (Ti.Platform.canOpenURL(url)) {
            
            return url;
        }
    }
    
    return '';
};

/**
 * Verifies whether it is possible to rate the app on the current platform and device. For example it is not possible 
 * to rate if platform is a mobile web app.
 *
 * @returns  {boolean}  true if the device and platform allows to rate the app, false otherwise.
 */
Rating.prototype.canRate = function () {

    var storeUrl = this.getStoreUrl();
    
    return !!storeUrl;
};

/**
 * Opens the app in Google Play Store or Apple App Store where user is able to rate/review the app. 
 * Opens the store only if device and platform supports rating.
 */
Rating.prototype.rate = function () {

    if (!this.canRate()) {

        return;
    }

    var storeUrl = this.getStoreUrl();

    if (!storeUrl) {

        return;
    }
    
    remindMe = false;
    this.store();

    try {
        Ti.Platform.openURL(storeUrl);
    } catch (e) {
        console.warn('Failed to open url ' + storeUrl, 'Piwik.App.Rating::rate');
    }
};

module.exports = Rating;
