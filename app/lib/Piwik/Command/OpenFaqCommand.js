/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('Piwik');

/**
 * @class     Open FAQ command.
 *
 * @exports   OpenFaqCommand as Piwik.Command.OpenFaqCommand
 * @augments  Piwik.UI.View
 */
function OpenFaqCommand () {
}

/**
 * Extend Piwik.UI.View
 */
OpenFaqCommand.prototype = Piwik.require('UI/View');
    
/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
OpenFaqCommand.prototype.getId = function () {
    return 'openFaqCommand';
};

/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
OpenFaqCommand.prototype.getLabel = function () {
    
    var _ = require('underscore');

    return _('General_Faq');
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
OpenFaqCommand.prototype.getButtonLabel = function () {
    return {image: 'images/ic_action_help.png',
            command: this,
            width: 37};
};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
OpenFaqCommand.prototype.getMenuIcon = function () {
    return {id: 'menuHelpIcon'};
};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
OpenFaqCommand.prototype.getMenuTrackingEvent = function () {
    return {title: 'Menu Click - Open Faq',
            url: '/menu-click/open-faq'};
};

/**
 * Execute the command. Opens the Piwik Mobile FAQ screen.
 */
OpenFaqCommand.prototype.execute = function () {
    this.create('Window', {url: 'help/faq', target: 'modal'});
};

/**
 * Undo the executed command.
 */
OpenFaqCommand.prototype.undo = function () {

};

module.exports = OpenFaqCommand;
