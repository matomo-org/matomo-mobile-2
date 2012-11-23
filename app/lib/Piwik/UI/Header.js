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
 * @class     A header is created by the method Piwik.UI.createrHeader. Creates a header view or uses the native header
 *            (iOS) respectively. Displays a headline within the header view which can be updated.
 *
 * @param     {Object}  [options]           See {@link Piwik.UI.View#setParams}
 * @param     {string}  [options.title=""]  Optional. The title.
 *
 * @exports   Header as Piwik.UI.Header
 * @augments  Piwik.UI.View
 */
function Header () {

    /**
     * The title/headline label. Used only on Android.
     *
     * @type  Titanium.UI.Label
     */
    this.titleLabel = null;

    /**
     * The header view which contains the title label. Used only on Android.
     *
     * @type  Titanium.UI.Label
     */
    this.headerView = null;
}

/**
 * Extend Piwik.UI.View
 */
Header.prototype = Piwik.require('UI/View');

/**
 * Initializes the header and pre-renders all required views.
 *
 * @returns  {Piwik.UI.Header}  An instance of the current state.
 */
Header.prototype.init = function () {

    this.createHeader();
    this.refresh();
    
    return this;
};

/**
 * Creates the header view and the headline label. Only for Android. We use the native header on iOS.
 */
Header.prototype.createHeader = function () {

    if (Piwik.getPlatform().isIos) {

        return;
    }

    this.headerView = Ti.UI.createView({id: 'headerView'});
    this.titleLabel = Ti.UI.createLabel({id: 'headerTitleLabel', text: ''});

    this.headerView.add(this.titleLabel);
    this.headerView.add(Ti.UI.createView({id: 'headerViewSeparator1'}));
    this.headerView.add(Ti.UI.createView({id: 'headerViewSeparator2'}));
    
    Ti.UI.currentWindow.add(this.headerView);
};

/**
 * Get the view which contains the header.
 *
 * @returns  {Titanium.UI.View|null}  Returns null on iOS. The header view on all other platforms.
 */
Header.prototype.getHeaderView = function () {
    
    return this.headerView;
};

/**
 * Sets (overwrites) the text of the headline.
 */
Header.prototype.setHeadline = function () {
    var win = this.getParam('window');
    
    if (Piwik.getPlatform().isIos && win && win.rootWindow) {
        win.rootWindow.title = this.getParam('title', '');
        win                  = null;

        return;
    }

    if (this.titleLabel) {
        this.titleLabel.text = this.getParam('title', '');
    }
};

/**
 * Refreshes the text of the headline depending on the given params.
 *
 * @param  {Object}  params  See {@link Piwik.UI.Header}
 */
Header.prototype.refresh = function (params) {

    if (params) {
        this.setParams(params);
        params = null;
    }

    this.setHeadline();
};

module.exports = Header;