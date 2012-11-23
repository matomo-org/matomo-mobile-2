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
 * @class     Choose another metric command.
 *
 * @exports   ChooseMetricCommand as Piwik.Command.ChooseMetricCommand
 * @augments  Piwik.UI.View
 */
function ChooseMetricCommand () {
    /**
     * The event will be fired as soon as the user changes the metric.
     *
     * @name   Piwik.Command.ChooseMetricCommand#event:onMetricChanged
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type    The name of the event.
     * @param  {string}  event.metric  The selected metric.
     */
}
    
/**
 * Extend Piwik.UI.View
 */
ChooseMetricCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
ChooseMetricCommand.prototype.getId = function () {
    return 'chooseMetricCommand';
};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
ChooseMetricCommand.prototype.getLabel = function () {
    
    var _  = require('library/underscore');
    
    return _('Mobile_ChooseMetric');
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
ChooseMetricCommand.prototype.getButtonLabel = function () {};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
ChooseMetricCommand.prototype.getMenuIcon = function () {};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
ChooseMetricCommand.prototype.getMenuTrackingEvent = function () {};

/**
 * Execute the command.
 */
ChooseMetricCommand.prototype.execute = function () {
    
    var metrics = this.getParam('metrics');

    if (!metrics) {
        return;
    }
    
    var options           = [];
    var internalNames     = [];
    var metricDisplayName = null;
    
    for (var metricInternalName in metrics) {
        if ('label' == metricInternalName) {
            continue;
        }
        
        metricDisplayName = metrics[metricInternalName];
        
        options.push(String(metricDisplayName));
        internalNames.push(String(metricInternalName));
    }
    
    var _  = require('library/underscore');
    
    options.push(_('SitesManager_Cancel_js'));
    
    var dialog = Titanium.UI.createOptionDialog({
        title: this.getLabel(),
        options: options,
        cancel:options.length - 1
    });
    
    var that = this;
    dialog.addEventListener('click', function (event) {
        if (!event || event.cancel === event.index || true === event.cancel) {

            return;
        }
        
        that.changeMetric(internalNames[event.index]);
    });
    
    dialog.show();
    
    metrics = null;
};

/**
 * Undo the executed command.
 */
ChooseMetricCommand.prototype.undo = function () {
    
};

/**
 * Changes the current selected metric and fires an event named 'onMetricChanged'.
 * The passed event contains a property named 'metric' which holds the changed value.
 *
 * @param  {string}  metric  The changed metric.
 *
 * @fires  Piwik.Command.ChooseMetricCommand#event:onMetricChanged
 */
ChooseMetricCommand.prototype.changeMetric = function (metric) {
    this.fireEventInWindow('onMetricChanged', {metric: metric, type: 'onMetricChanged'});
};

module.exports = ChooseMetricCommand;