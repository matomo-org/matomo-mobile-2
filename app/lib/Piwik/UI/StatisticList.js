/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik       = require('library/Piwik');

/**
 * @class     A statistic list is created by the method Piwik.UI.createStatisticList. It displays a list of all given
 *            statistics. Each statistic will be rendered into a TableViewRow. Therefore, you need a TableView in order
 *            to display the rendered content.
 * 
 * @param     {Object}   params            See {@link Piwik.UI.View#setParams}
 * @param     {Array}    params.values     An array containing multiple values. Each value is represented by an
 *                                         object which has to provide a property named 'title' and 'value'.
 *                                         The values are displayed in the same order as the array contains them.
 *                                         Logo is optional and has to be an absolute path to an image (including)
 *                                         domain.
 *                                         Array (
 *                                             [int] => Object (
 *                                                         [title]       => []
 *                                                         [value]       => []
 *                                                         [logo]        => []
 *                                                         [logoWidth]   => []
 *                                                         [logoHeight]  => []
 *                                                      )
 *                                         )
 * @param     {boolean}  [params.showAll]  Optional. Whether show all results is activated or not
 * 
 * @exports   StatisticList as Piwik.UI.StatisticList
 * @augments  Piwik.UI.View
 */
function StatisticList () {

    /**
     * This event will be fired as soon as the user presses the paginator row containing the label "show all/show less".
     * This inverts the current "showAll" value.
     *
     * @name   Piwik.UI.StatisticList#event:onPaginatorChanged
     * @event
     *
     * @param  {Object}   event
     * @param  {string}   event.type     The name of the event.
     * @param  {boolean}  event.showAll  The changed showAll value.
     */

    /**
     * Holds an array of all rendered TableViewRows.
     *
     * ARRAY ( [int] => [TableViewRow] )
     *
     * @type  Array|null
     */
    this.rows = null;
}

/**
 * Extend Piwik.UI.View
 */
StatisticList.prototype = Piwik.require('UI/View');

/**
 * Initializes the statistic list and triggers the rendering of the statistic values.
 *
 * @returns  {Piwik.UI.StatisticList}  An instance of the current state.
 */
StatisticList.prototype.init = function () {

    this.rows = [];

    this.renderList();
    this.renderPaginator();
    
    return this;
};

/**
 * Get the previous rendered content (TableViewRows).
 * 
 * @returns  {Array}  An array containing all generated TableViewRows.
 *                    ARRAY ( [int] => [TableViewRow] )
 */
StatisticList.prototype.getRows = function () {

    var rows  = this.rows;
    this.rows = null;

    return rows;
};

/**
 * Adds the statistic values to the rendered rows list.
 */
StatisticList.prototype.renderList = function () {

    var values  = this.getParam('values', []);

    if (!values || !Piwik.isArray(values) || 0 === values.length) {
        // no values defined, display at least an information about this

        var _   = require('library/underscore');
        var row = Ti.UI.createTableViewRow({className: 'statisticListNoDataTableViewRow',
                                            title: _('CoreHome_TableNoData')});

        this.rows.push(row);
        row     = null;
        _       = null;
     
        return;
    }

    for (var index = 0; index < values.length; index++) {
        var statistic = values[index];
        
        if (!statistic) {
            continue;
        }
        
        var row     = this.create('StatisticListEntry', statistic);
        var statRow = row.getRow();
        
        this.rows.push(statRow);
        
        statRow = null;
        row     = null;
    }
    
    values = null;
};

/**
 * Adds a paginator. Adds nothing if not enough statistic values are given (less or equal than the configured
 * filterLimit). Otherwise it adds a 'show more / show less' button depending on the current state of the 'showAll'
 * parameter.
 *
 * @fires  Piwik.UI.StatisticList#event:onPaginatorChanged
 */
StatisticList.prototype.renderPaginator = function () {

    var config = require('config');

    if (config.piwik.filterLimit > this.rows.length) {
        // a show all or show less button only makes sense if there are more or equal results than the used
        // filter limit value...
        config = null;
    
        return;
    }
    
    config           = null;
    var _            = require('library/underscore');
    var showAll      = this.getParam('showAll', false);
    
    var paginatorRow = Ti.UI.createTableViewRow({
        className: 'statisticListPaginatorTableViewRow',
        title: showAll ? _('Mobile_ShowLess') : _('Mobile_ShowAll')
    });

    var that = this;
    paginatorRow.addEventListener('click', function (event) {
        that.fireEventInWindow('onPaginatorChanged', {showAll: !showAll, type: 'onPaginatorChanged'});
    });
    
    this.rows.push(paginatorRow);
    paginatorRow = null;
};

/**
 * Cleanup.
 */
StatisticList.prototype.cleanup = function () {
    this.rows = null;
};

module.exports = StatisticList;