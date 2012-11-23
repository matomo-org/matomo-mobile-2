/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     A visitor overview is created by the method Piwik.UI.createVisitorOverview. The visitor overview UI widget
 *            displays a short overview of a single visitor. Like visit date/time, referrer, number of actions, duration
 *            of the visit and more. The overview will be rendered into a TableViewRow. Therefore, you need a TableView
 *            in order to display the rendered content. The rendered row is accessible via getRow().
 *
 * @param     {Object}   params                See {@link Piwik.UI.View#setParams}
 * @param     {Object}   params.visitor        An object containing all available visitor information. As returned by the
 *                                             method 'Live.getgetLastVisitsDetails'.
 * @param     {string}   params.accessUrl      The url to the piwik installation (to the piwik installation the visit
 *                                             belongs to) containing a trailing slash. For example 
 *                                             'http://demo.piwik.org/'
 * @param     {boolean}  params.useFirstVisit  Display date, time, ... from the first visit.
 *
 * @example
 * var overview = Piwik.getUI().createVisitorOverview({visitor: visitor, accessUrl: accessUrl});
 * var row      = overview.getRow();
 *
 * @exports   VisitorOverview as Piwik.UI.VisitorOverview
 * @augments  Piwik.UI.View
 */
function VisitorOverview () {

    /**
     * Holds the row where the content will be rendered into.
     *
     * @type  null|Ti.UI.TableViewRow
     * 
     * @private
     */
    this._row  = null;
}

/**
 * Extend Piwik.UI.View
 */
VisitorOverview.prototype = Piwik.require('UI/View');

/**
 * Initializes and renders the visitor overview.
 *
 * @returns  {Piwik.UI.LiveOverview}  An instance of the current state.
 */
VisitorOverview.prototype.init = function () {

    var visitor   = this.getParam('visitor');
    var accessUrl = this.getParam('accessUrl', '');
    
    var rowClass  = 'visitorOverviewTableViewRow';
    if (visitor && visitor.goalConversions) {
        rowClass  = 'visitorOverviewAchievedGoalTableViewRow';
    }

    this._row     = Ti.UI.createTableViewRow({className: rowClass});

    if (!visitor) {
        Piwik.getLog().warn('Not able to render VisitorOverview. Visitor is not given',
                       'Piwik.UI.VisitorOverview::init');

        return this;
    }

    // we can not add the following label and icons directly to the row cause we want to display them in a
    // horizontal layout. Therefore we need the dateAndIconsView.
    var dateAndIconsView = Ti.UI.createView({id: 'visitorOverviewDateView'});

    var timeLabel = '';
    if (this.getParam('useFirstVisit', false)) {
        timeLabel = visitor.serverDatePrettyFirstAction + ' - ' + visitor.serverTimePrettyFirstAction;
    } else {
        timeLabel = visitor.serverDatePretty + ' - ' + visitor.serverTimePretty;
    }
    
    this._row.popoverView     = null;
    if (Piwik.getPlatform().isIpad) {
        this._row.popoverView = dateAndIconsView;
    }

    dateAndIconsView.add(Ti.UI.createLabel({text: timeLabel,
                                            id: 'visitorOverviewDateTimeLabel'}));

    // use different className for the first icon. This makes it possible to specify for example another distance
    var iconClass = 'visitorOverviewFirstIcon';

    if (accessUrl && visitor.countryFlag) {
        dateAndIconsView.add(Ti.UI.createImageView({image: accessUrl + visitor.countryFlag,
                                                    id: 'visitorOverviewCountryFlagImageView',
                                                    className: iconClass}));
        iconClass = 'visitorOverviewFollowingIcon';
    }

    if (accessUrl && visitor.browserIcon) {
        dateAndIconsView.add(Ti.UI.createImageView({image: accessUrl + visitor.browserIcon,
                                                    id: 'visitorOverviewBrowserIconImageView',
                                                    className: iconClass}));
        iconClass = 'visitorOverviewFollowingIcon';
    }

    if (accessUrl && visitor.operatingSystemIcon) {
        dateAndIconsView.add(Ti.UI.createImageView({image: accessUrl + visitor.operatingSystemIcon,
                                                    id: 'visitorOverviewOperatingSystemIconImageView',
                                                    className: iconClass}));
        iconClass = 'visitorOverviewFollowingIcon';
    }

    this._row.add(dateAndIconsView);
    dateAndIconsView = null;

    var referrerText = this.getReferrerDescription(visitor);
    if (referrerText) {
        this._row.add(Ti.UI.createLabel({text: referrerText,
                                         id: 'visitorOverviewReferrerLabel'}));
    }

    if (visitor.goalConversions) {
        var goalsText = String.format(_('General_VisitConvertedNGoals'), '' + visitor.goalConversions);
        
        this._row.add(Ti.UI.createLabel({text: goalsText,
                                         id: 'visitorOverviewConvertedGoalsLabel'}));
    }

    var pageViewsText = this.getPageviewsDescription(visitor);
    if (pageViewsText) {
        this._row.add(Ti.UI.createLabel({text: pageViewsText,
                                         id: 'visitorOverviewPageviewsLabel'}));
    }
    
    visitor = null;

    return this;
};

/**
 * Get the rendered content/row of the visitor overview.
 *
 * @type  Titanium.UI.TableViewRow
 */
VisitorOverview.prototype.getRow = function () {

    var row   = this._row;
    this._row = null;
    
    return row;
};

/**
 * Generates a pageview description depending on the given visitor.
 *
 * @param    {Object}  visitor
 *
 * @returns  {string}  The generated page view description. Returns an empty string if no visitor or no action is
 *                     defined.
 */
VisitorOverview.prototype.getPageviewsDescription = function (visitor) {

    var description = '';

    if (!visitor) {

        return description;
    }

    if (visitor.actions && visitor.visitDurationPretty) {
        description = String.format('%s %s (%s)',
                                    '' + visitor.actions,
                                    _('General_ColumnPageviews'),
                                    '' + visitor.visitDurationPretty);
    } else if (visitor.actions) {
        description = String.format('%s %s', '' + visitor.actions, _('General_ColumnPageviews'));
    }
    
    visitor = null;

    return description;

};

/**
 * Generates a referrer description depending on the given visitor.
 *
 * @param    {Object}  visitor
 *
 * @returns  {string}  The generated referrer description. Returns an empty string if no visitor or no referrer is
 *                     defined.
 */
VisitorOverview.prototype.getReferrerDescription = function (visitor) {

    var description = '';

    if (!visitor) {
        
        return description;
    }

    if (visitor.referrerName) {

        description      = _('General_FromReferrer') + ' ' + visitor.referrerName;

        if (visitor.referrerKeyword) {
            description += ' - ' + visitor.referrerKeyword;
        }

        if (visitor.referrerKeywordPosition) {
            description += String.format(' %s: #%s', _('SEO_Rank'), '' + visitor.referrerKeywordPosition);
        }
        
    } else if (visitor.referrerTypeName) {
        description      = _('General_FromReferrer') + ' ' + visitor.referrerTypeName;
    }
    
    visitor = null;

    return description;
};

/**
 * Cleanup.
 */
VisitorOverview.prototype.cleanup = function () {
    this._row = null;
};

module.exports = VisitorOverview;