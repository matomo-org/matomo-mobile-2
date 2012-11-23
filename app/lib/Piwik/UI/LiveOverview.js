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
 * @class     A live overview is created by the method Piwik.UI.createLiveOverview. The live overview UI widget displays
 *            a short overview of the last visitors containing the number of pageviews and the number of visitors.
 *            The overview will be rendered into a TableViewRow. Therefore, you need a TableView to display the rendered
 *            content. The rendered row is accessible via getRow().
 *
 * @param     {Object}  params            See {@link Piwik.UI.View#setParams}
 * @param     {string}  params.title      The title of the overview.
 * @param     {number}  [params.actions]  Optional. The number of actions.
 * @param     {number}  [params.visits]   Optional. The number of visits.
 *
 * @example
 * var overview = Piwik.getUI().createLiveOverview({title: 'Last 30 Minutes', actions: 15, visits: 2});
 * var row      = overview.getRow();
 * overview.refresh({actions: 20, visits: 4});
 *
 * @exports   LiveOverview as Piwik.UI.LiveOverview
 * @augments  Piwik.UI.View
 */
function LiveOverview () {

    /**
     * Holds the row where the content will be rendered into.
     *
     * @type  null|Ti.UI.TableViewRow
     */
    this.row        = null;

    /**
     * The label which displays the value.
     *
     * @type  null|Ti.UI.Label
     */
    this.valueLabel = null;
}

/**
 * Extend Piwik.UI.View
 */
LiveOverview.prototype = Piwik.require('UI/View');

/**
 * Initializes and renders the live overview.
 *
 * @returns  {Piwik.UI.LiveOverview}  An instance of the current state.
 */
LiveOverview.prototype.init = function () {

    this.row        = Ti.UI.createTableViewRow({className: 'liveOverviewTableViewRow'});
    var container   = Ti.UI.createView({className: 'liveOverviewContainerView'});

    var titleLabel  = Ti.UI.createLabel({text: this.getParam('title', ''),
                                         id: 'liveOverviewTitleLabel'});

    container.add(titleLabel);
    titleLabel = null;

    this.valueLabel = Ti.UI.createLabel({text: '-', id: 'liveOverviewValueLabel'});

    this.refresh();

    container.add(this.valueLabel);
    
    this.row.add(container);
    
    container = null;

    return this;
};

/**
 * Update the live overview. Does currently update only the value.
 *
 * @param  {Object}  params  See {@link Piwik.UI.LiveOverview}
 */
LiveOverview.prototype.refresh = function (params) {

    if (params) {
        this.setParams(params);
        params = null;
    }

    var _      = require('library/underscore');

    var value  = String.format('%s %s, %s %s',
                               '' + this.getParam('visits', '-'),
                               _('General_ColumnNbVisits'),
                               '' + this.getParam('actions', '-'),
                               _('General_ColumnPageviews'));

    if (this.valueLabel) {
        this.valueLabel.text = value;
    }
};

/**
 * Get the rendered content/row of the live overview.
 *
 * @type  Titanium.UI.TableViewRow
 */
LiveOverview.prototype.getRow = function () {
    var row  = this.row;
    this.row = null;
    
    return row;
};

/**
 * Cleanup.
 */
LiveOverview.prototype.cleanup = function () {
    this.row = null;
};

module.exports = LiveOverview;