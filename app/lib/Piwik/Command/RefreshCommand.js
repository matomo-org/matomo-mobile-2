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
 * @class     Refresh command.
 *
 * @exports   RefreshCommand as Piwik.Command.RefreshCommand
 * @augments  Piwik.UI.View
 */
function RefreshCommand () {
}

/**
 * Extend Piwik.UI.View
 */
RefreshCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
RefreshCommand.prototype.getId = function () {
    return 'refreshCommand';
};

/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
RefreshCommand.prototype.getLabel = function () {

    var _ = require('library/underscore');

    return _('Mobile_Refresh');
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
RefreshCommand.prototype.getButtonLabel = function () {};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
RefreshCommand.prototype.getMenuIcon = function () {
    return {id: 'menuRefreshIcon'};
};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
RefreshCommand.prototype.getMenuTrackingEvent = function () {
    return {title: 'Menu Click - Refresh',
            url: '/menu-click/refresh'};
};

/**
 * Execute the command. Opens the 'add a new account' window.
 */
RefreshCommand.prototype.execute = function () {
    this.fireEventInWindow('fireRefresh', {type: 'fireRefresh'});
};

/**
 * Undo the executed command.
 */
RefreshCommand.prototype.undo = function () {
    
};

module.exports = RefreshCommand;