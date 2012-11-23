/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik       = require('library/Piwik');
/** @private */
var stringUtils = Piwik.require('Utils/String');

/**
 * @class     A statistic list entry is created by the method Piwik.UI.createStatisticListEntry. It displays a single
 *            statistics entry. The label value is placed on the left side whereas the value is displayed on the right 
 *            site. Each entry will be rendered as a TableViewRow. You need a TableView therefore to display the 
 *            rendered content.
 * 
 * @param     {Object}  params                  See {@link Piwik.UI.View#setParams}
 * @param     {string}  params.title            The title of the entry.
 * @param     {string}  [params.value]          The value of the entry.
 * @param     {string}  [params.idSubtable]     The id of a subtable if one exists.
 * @param     {string}  [params.logo]           The url to the icon.
 * @param     {string}  [params.logoWidth=16]   The width of the icon.
 * @param     {string}  [params.logoHeight=16]  The height of the icon.
 * 
 * @exports   StatisticListEntry as Piwik.UI.StatisticListEntry
 * @augments  Piwik.UI.View
 */
function StatisticListEntry () {

    /**
     * Holds the rendered tableViewRow once the widget is initialized.
     *
     * @type  Ti.UI.TableViewRow|null
     */
    this.row = null;
}

/**
 * Extend Piwik.UI.View
 */
StatisticListEntry.prototype = Piwik.require('UI/View');

/**
 * Initializes and renders the statistic list entry.
 *
 * @returns  {Piwik.UI.StatisticListEntry}  An instance of the current state.
 */
StatisticListEntry.prototype.init = function () {

    var idSubtable = this.getParam('idSubtable');
    var value      = this.getParam('value', ' - ');
    var title      = this.getParam('title', '');
    var logo       = this.getParam('logo', '');

    var rowClassName    = 'statisticListTableViewRow';
    var valueClassName  = 'statisticListValueLabel';
    if (!!idSubtable) {
        rowClassName   += 'HasSubtable';
        valueClassName += 'HasSubtable';
    }
    
    this.row  = Ti.UI.createTableViewRow({className: rowClassName, 
                                          idSubtable: idSubtable,
                                          reportName: title});

    var titleLabel = Ti.UI.createLabel({text: title ? ('' + title) : '',
                                        className: 'statisticListTitleLabel' + (logo ? 'WithLogo' : '')});

    this.row.add(titleLabel);
    titleLabel = null;

    var valueLabel = Ti.UI.createLabel({text: value ? ('' + value) : ' - ', className: valueClassName});
    
    this.row.add(valueLabel);
    valueLabel = null;
                                        
    if (Piwik.getPlatform().isAndroid && !!idSubtable) {
        this.row.add(Ti.UI.createImageView({className: 'tableViewRowArrowRightImage'}));
    }
    
    if (logo) {
        var imageView = Ti.UI.createImageView({height: this.getParam('logoHeight', 16),
                                               width: this.getParam('logoWidth', 16),
                                               image: '' + logo,
                                               canScale: !Piwik.getPlatform().isAndroid,
                                               hires: !Piwik.getPlatform().isAndroid,
                                               enableZoomControls: false,
                                               className: 'statisticListLogoImage'});
        
        this.row.add(imageView);
        imageView = null;
    }
    
    return this;
};

/**
 * Get the previous rendered content (TableViewRows).
 * 
 * @returns  {Array}  An array containing all generated TableViewRows.
 *                    ARRAY ( [int] => [TableViewRow] )
 */
StatisticListEntry.prototype.getRow = function () {

    var row  = this.row;
    this.row = null;

    return row;
};

/**
 * Cleanup.
 */
StatisticListEntry.prototype.cleanup = function () {
    this.row = null;
};

module.exports = StatisticListEntry;