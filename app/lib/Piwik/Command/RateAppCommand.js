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
 * @class     Rate app on the App Store Command.
 *
 * @exports   RateAppCommand as Piwik.Command.RateAppCommand
 * @augments  Piwik.UI.View
 */
function RateAppCommand () {
}

/**
 * Extend Piwik.UI.View
 */
RateAppCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
RateAppCommand.prototype.getId = function () {
    return 'rateAppCommand';
};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
RateAppCommand.prototype.getLabel = function () {
    return '';
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
RateAppCommand.prototype.getButtonLabel = function () {};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
RateAppCommand.prototype.getMenuIcon = function () {};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
RateAppCommand.prototype.getMenuTrackingEvent = function () {};

/**
 * Execute the command. Rate the app on the App Store.
 */
RateAppCommand.prototype.execute = function () {
    Piwik.require('App/Rating').rate();
};

/**
 * Undo the executed command.
 */
RateAppCommand.prototype.undo = function () {

};

module.exports = RateAppCommand;