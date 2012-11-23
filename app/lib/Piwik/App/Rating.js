/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');

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
 * 
 * @exports  Rating as Piwik.App.Rating
 */
function Rating () {

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

    var _       = require('library/underscore');
    var message = String.format(_('Mobile_RatingPleaseRateUs'), this.getStoreName(), 'mobile@piwik.org');
    var buttons = [_('Mobile_RatingNow'), _('Mobile_RatingNotNow'), _('Mobile_RatingDontRemindMe')];
    _           = null;
    
    var dialog  = Ti.UI.createAlertDialog({message: message, 
                                           buttonNames: buttons,
                                           cancel: 2});

    var that    = this;
    dialog.addEventListener('click', function (event) {
        if (!event || true === event.cancel || event.cancel === event.index) {
            // user pressed the "Don't remind me" button
            remindMe = false;
            
            Piwik.getTracker().trackEvent({title: 'Dont remind me', url: '/rating/dont-remind-me'});

        } else if (0 == event.index) {
            remindMe = false;

            that.rate();
            
            Piwik.getTracker().trackEvent({title: 'Rate now', url: '/rating/rate-now'});
        
        } else if (1 == event.index) {
            Piwik.getTracker().trackEvent({title: 'Rate not now', url: '/rating/not-now'});
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
    
    if (Piwik.getPlatform().isAndroid) {

        storeName = 'Google Play Store';

    } else if (Piwik.getPlatform().isIos) {

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

    if (Piwik.getPlatform().isAndroid) {
        // @todo what if android market isn't installed?

        return 'market://details?id=' + Ti.App.id;

    } else if (Piwik.getPlatform().isIos) {

        var config   = require('config');
        var appStore = config.appleAppStore;
        config       = null;
        
        if (!appStore || !appStore.appId) {
            // no app store id configured.
            
            return '';
        }

        var url = 'itms-apps://ax.itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=';
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
        Piwik.getLog().warn('Failed to open url ' + storeUrl, 'Piwik.App.Rating::rate');
    }
};

module.exports = Rating;