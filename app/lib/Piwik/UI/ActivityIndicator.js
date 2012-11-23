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
 * @class     An Activity Indicator is created by the method Piwik.UI.createActivityIndicator. An activity indicator can
 *            be used to show the progress of an operation to let the user know some action is taking place.
 *
 * @exports   ActivityIndicator as Piwik.UI.ActivityIndicator
 * @augments  Piwik.UI.View 
 */
function ActivityIndicator () {

    /**
     * A counter to detect how often the 'show' method was called. Increments on each 'show' call and
     * decrements on each 'hide' call. This helps us to decide when we have to really hide the indicator.
     * Possible scenario:
     *
     * show
     * do some stuff - start process 1
     * show
     * do some stuff - start process 2
     * do some stuff - end process 2
     * show    -> If we do not count how often the 'show' method was previously called and simply hide the
     *            indicator as soon as this method is called, the first process still runs while
     *            the indicator is already removed. Therefore we just have to decrement the counter here.
     *            We are not allowed to hide the indicator at this moment.
     * do some stuff - end process 1
     * hide    -> Because the number of 'show' and 'hide' calls are the same, we are allowed to really hide
     *            the indicator now.
     *
     * @type  int
     * 
     * @private
     */
    this._numRequests = 0;

    /**
     * A string that defines which style shall be used. Available values are 'waiting' and 'loading'. Both are able
     * to display a message while they are displayed.
     *
     * The 'waiting' style is a native wait indicator {@link Ti.UI.ActivityIndicator}.
     * The 'loading' style is a simple view containing a message displayed in the center of the window.
     *
     * @example
     * var activityIndicator   = Piwik.getUI().createActivityIndicator();
     * activityIndicator.style = 'loading';
     * activityIndicator.show();
     *
     * @defaults  "waiting"
     *
     * @type      string
     */
    this.style        = 'waiting';

    /**
     * The window where the loading message will be rendered into. We need a reference to this window cause otherwise
     * we can't hide and remove the loading message.
     *
     * @type  null|Piwik.UI.Window
     */
    this.view         = null;
}

/**
 * Extend Piwik.UI.View
 */
ActivityIndicator.prototype = Piwik.require('UI/View');

ActivityIndicator.prototype.init = function () {

};

/**
 * Shows an Activity Indicator. To remove the indicator, simply call 'hide' as soon as your script has finished.
 * Its useful to show the indicator for example as long as you fetch some data. Make sure the hide method will
 * be called afterwards. Otherwise, the Activity Indicator will be displayed for a long time. The style property
 * defines how the wait indicator will be displayed {@link Piwik.UI.ActivityIndicator#style}.
 *
 * @param  {string}  [message]  Optional. Message that will be displayed while the activity indicator is active.
 *                              If the style is 'loading' we display a 'Loading...' message by default. The
 *                              visible message will be updated each time you call show()
 *
 * @example
 * var activityIndicator = Piwik.getUI().createActivityIndicator();
 * activityIndicator.show();
 * doSomething1();
 * activityIndicator.show('Loading');
 * activityIndicator.hide();
 * doSomething2();
 * activityIndicator.show('Verifying');
 * activityIndicator.hide();
 * doSomething3();
 * activityIndicator.hide();
 */
ActivityIndicator.prototype.show = function (message) {

    Piwik.getLog().debug('showWaitIndicator' + this._numRequests + ' style: ' + this.style,
                         'Piwik.UI.ActivityIndicator::show');

    this._numRequests++;
    
    this.view = this.getParam('window');
        
    if (!this.view) {
        Piwik.getLog().warn('Can not display ActivityIndicator, window is not set', 'ActivityIndicator::show');
        
        return;
    }

    switch (this.style) {
        case 'loading':

            var _  = require('library/underscore');

            if (this._numRequests > 1) {
                // just update the text cause loading message is already visible
                
                if (message && this.view.loadingMessage) {
                    this.view.loadingMessage.text = message;
                } else if (this.view.loadingMessage) {
                    // default message
                    this.view.loadingMessage.text = _('General_LoadingData');
                }

                return;
            }

            if (!this.view.loadingMessage && this.view.add) {
                // the loading message does not exist, create it
                this.view.loadingMessage = Ti.UI.createLabel({
                    text: message ? message : _('General_LoadingData'),
                    id: 'loadingActivityIndicatorLabel'
                });

                this.view.add(this.view.loadingMessage);
            }

            break;

        case 'waiting':
        default:
        
            var win = this.view;

            if (1 < this._numRequests) {
                // just update the text cause wait indicator is already visible

                if (win && win.waitIndicatorImage && message) {
                    win.waitIndicatorImage.message = message;
                }
                
                win = null;

                return;
            }

            if (!win.waitIndicatorImage) {
                // the waitIndicator does not exist, create it

                win.waitIndicatorImage = Ti.UI.createActivityIndicator({
                    id: 'activityWaitIndicator',
                    message: message ? message : '',
                    style: Piwik.getPlatform().isIos ? Ti.UI.iPhone.ActivityIndicatorStyle.DARK : ''
                });
                
                if (Piwik.getPlatform().isIos) {
                    // On iOS and Mobile Web, the activity indicator is a view like any other view, and must be added 
                    // to a window or other top-level view before it can be shown
                    win.add(win.waitIndicatorImage);
                }
            }

            win.waitIndicatorImage.show();
            
            win = null;

            break;
    }

    var that = this;
    function waitIndicatorTimeout () {
        that.hide(true);
    }

    var settings = Piwik.require('App/Settings');

    // this ensures the activity indicator will be removed even if the hide method was not called due to any error.
    this.waitIndicatorTimeout = setTimeout(waitIndicatorTimeout, (settings.getHttpTimeout() * 1.6));
    settings                  = null;
};

/**
 * Hides the previously activated Activity Indicator. Make sure to call the hide method in each possible scenario.
 * Attend that the wait indicator is only removed as soon as the number of 'show' calls is the same as the
 * 'hide' calls.
 *
 * @param  {boolean}  [force=false]  if true it will definitely hide the activity indicator. Independently how often
 *                                   the 'show' method was called before.
 *
 * @type   null
 */
ActivityIndicator.prototype.hide = function (force) {
    Piwik.getLog().debug('hideWaitIndicator' + this._numRequests + ' style: ' + this.style,
                         'Piwik.UI.ActivityIndicator::hide');

    if (('undefined' !== (typeof force)) && force) {
        this._numRequests = 1;
    }

    if (0 === this._numRequests) {
        // show method was not previously called

        return;
    }

    if (this.waitIndicatorTimeout) {
        // clear the timeout, makes sure the hide method will not be called again via the timeout.
        clearTimeout(this.waitIndicatorTimeout);

        this.waitIndicatorTimeout = null;
    }

    this._numRequests--;

    if (0 !== this._numRequests) {
        // the number of 'hide' calls is not equal to the number of 'show' calls. do nothing.

        return;
    }
    
    this.view = this.getParam('window');
    
    if (!this.view) {
        return;
    }
    
    var win = this.view;

    // remove style 'waiting'
    if (win && win.waitIndicatorImage && win.waitIndicatorImage.hide) {
        win.waitIndicatorImage.hide();
        
        if (Piwik.getPlatform().isIos) {
            // On iOS and Mobile Web, the activity indicator is a view like any other view, and must be added 
            // to a window or other top-level view before it can be shown
            win.remove(win.waitIndicatorImage);
        }
    }

    // remove style 'loading'
    if (this.view.loadingMessage && this.view.loadingMessage.hide) {
        this.view.loadingMessage.hide();
    }

    if (this.view.loadingMessage && this.view.remove) {
        this.view.remove(this.view.loadingMessage);
        this.view.loadingMessage = null;
        this.view                = null;
    }
    
    win = null;
};

/**
 * Cleanup.
 */
ActivityIndicator.prototype.cleanup = function () {
    this.view = null;
};

module.exports = ActivityIndicator;