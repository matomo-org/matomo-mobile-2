/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik     = require('library/Piwik');
/** @private */
var _         = require('library/underscore');

/**
 * @class     A refresh UI widget is created by the method Piwik.UI.createRefresh. The refresh widget adds the
 *            possibility to refresh an already opened window. On iOS it does currently only support to add a
 *            PullToRefresh view to a tableView. It uses the Android Option Menu on Android.
 *
 * @param     {Object}  [params]            See {@link Piwik.UI.View#setParams}
 * @param     {string}  [params.tableView]  Optional. Only required on iOS. The tableView where the PullToRefresh
 *                                          view shall be added.
 * 
 * @example
 * var tableview = Ti.Ui.createTableView();
 * var refresh   = Piwik.getUI().createRefresh({tableView: tableview});
 * requestSomeData();
 * refresh.refreshDone();
 * 
 * @exports   Refresh as Piwik.UI.Refresh
 * @augments  Piwik.UI.View
 */
function Refresh () {

    /**
     * This event will be fired as soon as the user triggers a window refresh. For example via PullToRefresh or via
     * OptionMenu. This means we have to reload the complete data.
     *
     * @name   Piwik.UI.Refresh#event:onRefresh
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     */

    /**
     * The current reloading state. If true, a refresh is already in progress and we should not do a further refresh.
     *
     * @defaults  false
     *
     * @type      boolean
     */
    this.reloading = false;

    /**
     * Only for iOS. The current pulling state. If true, the user is currently pulling the tableView.
     *
     * @defaults  false
     *
     * @type      boolean
     */
    this.pulling   = false;

    /**
     * Only for Android. Holds an instance of the activity indicator while the window is reloading. 
     *
     * @defaults  false
     *
     * @type      Piwik.UI.ActivityIndicator
     * 
     * @private
     */
    this._activityIndicator = null;
}

/**
 * Extend Piwik.UI.View
 */
Refresh.prototype = Piwik.require('UI/View');

/**
 * Initialize the refresh UI widget. Adds an Android Option Menu Item and triggers the addition of the PullToRefresh
 * view.
 */
Refresh.prototype.init = function () {

    if (Piwik.getPlatform().isIos) {
        
        this.attachHeaderView();

        // do the initial refresh
        this.displayRefreshingMessage();
        
        return this;
    } 

    var that = this;
    this.getParam('window').addEventListener('fireRefresh', function () {

        if (that) {
            that.refresh();
        }
        
    });
    
    this.displayRefreshingMessage();

    return this;
};

/**
 * Overwrites the default addEventListener. Connect events to the tableview. Prevents issues when using
 * the refersh UI widget twice within a single window. Otherwise always both refresh UI widgets will get the event.
 * 
 * @see  Piwik.UI.View#addEventListener
 */
Refresh.prototype.addEventListener = function (name, callback) {

    var tableView = this.getParam('tableView');

    if (!tableView) {

        return;
    }
    
    tableView.addEventListener(name, callback);
    
    tableView = null;
    callback  = null;
};

/**
 * Overwrites the default removeEventListener. Connect events to the tableview. Prevents issues when using
 * the refersh UI widget twice within a single window. Otherwise always both refresh UI widgets will get the event.
 *
 * @see  Piwik.UI.View#removeEventListener
 */
Refresh.prototype.fireEvent = function (name, event) {
    var tableView = this.getParam('tableView');

    if (!tableView) {

        return;
    }

    tableView.fireEvent(name, event);
    
    tableView = null;
    event     = null;
};

/**
 * Displays an activity indicator and a message that the window is currently reloading the data.
 */
Refresh.prototype.displayRefreshingMessage = function () {
    
    if (!Piwik.getPlatform().isIos) {
    
        if (!this._activityIndicator) {
            // create the activity indicator if not already created
            this._activityIndicator = this.create('ActivityIndicator', {});
        }
    
        this._activityIndicator.style = 'loading';
        this._activityIndicator.show();
        
        return;
    }

    var tableView  = this.getParam('tableView');
    if (tableView) {
        tableView.setContentInsets({top: 60});
    }

    var now                      = new Date();
    var dateUtils                = Piwik.require('Utils/Date');
    
    this.lastUpdatedLabel.text   = String.format(_('Mobile_LastUpdated'), dateUtils.toLocaleTime(now));
    this.statusLabel.text        = _('Mobile_Reloading');
    
    this.pullViewArrow.hide();
    this.pullViewArrow.transform = Ti.UI.create2DMatrix();
    
    this.actInd.show();
    
    tableView = null;
    dateUtils = null;
}

/**
 * Triggers the refresh state if no "refresh/reload" is already running.
 *
 * @fires  Piwik.UI.Refresh#event:onRefresh
 */
Refresh.prototype.refresh = function () {
    
    if (this.reloading) {
        // refresh is already in progress
        
        return;
    }
    
    this.reloading = true;
    this.pulling   = false;

    this.displayRefreshingMessage();
    
    this.fireEvent('onRefresh', {type: 'onRefresh'});
};

/**
 * Call this method as soon as all requested data has been loaded. The method will reset/hide all previous
 * activity indicators and loading messages. Normally, we would solve this via an refresh.fireEvent('done') but
 * we have to execute this synchronous. The event would be executed async and some features would not work like
 * tableview.scrollToTop while setContentInsets is running in parallel.
 */
Refresh.prototype.refreshDone = function () {
    this.reloading = false;
    
    if (!Piwik.getPlatform().isIos) {

        if (this._activityIndicator) {
            this._activityIndicator.hide();
        }

        return;
    }

    var tableView = this.getParam('tableView');
    if (tableView) {
        tableView.setContentInsets({top: 0});
    }
    
    if (this.statusLabel) {
        this.statusLabel.text = _('Mobile_PullDownToRefresh');
    }
    
    if (this.pullViewArrow) {
        this.pullViewArrow.show();
    }
    
    if (this.actInd) {
        this.actInd.hide();
    }
    
    tableView = null;
};

/**
 * Only for iOS. Builds the "PullToRefresh" view and adds it to the given tableView.
 */
Refresh.prototype.attachHeaderView = function () {

    if (!Piwik.getPlatform().isIos) {
        // this feature is only supported on iOS.

        return;
    }
    
    var tableView = this.getParam('tableView');

    if (!tableView) {

        return;
    }

    var that           = this;

    // pull to refresh, not supported by android
    var pullViewHeader = Ti.UI.createView({id: 'pullToRefreshHeader'});

    this.pullViewArrow = Ti.UI.createView({id: 'pullToRefreshArrowImage'});

    this.statusLabel   = Ti.UI.createLabel({
        text: _('Mobile_PullDownToRefresh'),
        id: 'pullToRefreshStatusLabel',
        shadowOffset: {x: 0, y: 1}
    });
    
    this.lastUpdatedLabel = Ti.UI.createLabel({
        text: '',
        id: 'pullToRefreshUpdateLabel',
        shadowOffset: {x: 0, y: 1}
    });

    this.actInd = Ti.UI.createActivityIndicator({
        left: 20,
        bottom: 13,
        width: 30,
        height: 30,
        style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK
    });

    pullViewHeader.add(this.pullViewArrow);
    pullViewHeader.add(this.statusLabel);
    pullViewHeader.add(this.lastUpdatedLabel);
    pullViewHeader.add(this.actInd);

    tableView.setHeaderPullView(pullViewHeader);
    pullViewHeader           = null;

    tableView.addEventListener('scroll', function(event) {
        // fired each time the user scrolls within the tableview

        var offset = (event && event.contentOffset) ? event.contentOffset.y : 0;

        var transform;
        if (offset <= -65.0 && !that.pulling && !that.reloading) {
            transform     = Ti.UI.create2DMatrix();
            transform     = transform.rotate(-180);
            that.pulling  = true;

            that.pullViewArrow.animate({transform: transform, duration: 180});
            that.statusLabel.text = _('Mobile_ReleaseToRefresh');

        } else if (that.pulling && !that.reloading && offset > -65.0 && offset < 0) {
            that.pulling  = false;
            transform     = Ti.UI.create2DMatrix();

            that.pullViewArrow.animate({transform: transform, duration: 180});
            that.statusLabel.text = _('Mobile_PullDownToRefresh');
        }
    });

    tableView.addEventListener('dragEnd', function(event) {

        if (that.pulling && !that.reloading) {
            var refreshEvent = {title: 'Refresh Page',
                                url: '/refresh/ios-pull-to-refresh'};
            Piwik.getTracker().trackEvent(refreshEvent);

            // the user was pulling, no reloading is currently running, the user scrolled to the correct section
            that.refresh();
        }
    });
    
    tableView = null;
};

/**
 * Cleanup.
 */
Refresh.prototype.cleanup = function () {
    this.pullViewArrow      = null;
    this.statusLabel        = null;
    this.lastUpdatedLabel   = null;
    this.actInd             = null;
    this._activityIndicator = null;
};

module.exports = Refresh;