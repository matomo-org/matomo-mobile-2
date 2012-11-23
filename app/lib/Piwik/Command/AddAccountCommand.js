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
 * @class     Add a Piwik account command.
 *
 * @exports   AddAccountCommand as Piwik.Command.AddAccountCommand
 * @augments  Piwik.UI.View
 */
function AddAccountCommand () {
}

/**
 * Extend Piwik.UI.View
 */
AddAccountCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
AddAccountCommand.prototype.getId = function () {
    return 'addAccountCommand';
};

/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
AddAccountCommand.prototype.getLabel = function () {

    var _ = require('library/underscore');

    return _('Mobile_AddAccount');
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
AddAccountCommand.prototype.getButtonLabel = function () {
    return {image: 'images/header_add.png',
            command: this,
            width: 37};
};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
AddAccountCommand.prototype.getMenuIcon = function () {
    return {id: 'menuAddAccountIcon'};
};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
AddAccountCommand.prototype.getMenuTrackingEvent = function () {
    return {title: 'Menu Click - Add Account',
            url: '/menu-click/add-account'};
};

/**
 * Execute the command. Opens the 'add a new account' window.
 */
AddAccountCommand.prototype.execute = function () {
    this.create('Window', {url: 'settings/editaccount', target: 'modal'});
};

/**
 * Undo the executed command.
 */
AddAccountCommand.prototype.undo = function () {
    
};

module.exports = AddAccountCommand;