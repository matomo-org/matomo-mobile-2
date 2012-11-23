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
 * @class     Open settings screen command.
 *
 * @exports   OpenSettingsCommand as Piwik.Command.OpenSettingsCommand
 * @augments  Piwik.UI.View
 */
function OpenSettingsCommand () {
}

/**
 * Extend Piwik.UI.View
 */
OpenSettingsCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
OpenSettingsCommand.prototype.getId = function () {
    return 'openSettingsCommand';
};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
OpenSettingsCommand.prototype.getLabel = function () {
    
    var _ = require('library/underscore');
    
    return _('General_Settings');
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
OpenSettingsCommand.prototype.getButtonLabel = function () {
    
    if (Piwik.getPlatform().isIpad) {
        
        return;
    }
    
    return {image: 'images/ic_action_settings.png',
            command: this,
            width: 37};
};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
OpenSettingsCommand.prototype.getMenuIcon = function () {
    return {id: 'menuSettingsIcon'};
};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
OpenSettingsCommand.prototype.getMenuTrackingEvent = function () {
    return {title: 'Menu Click - Open Settings',
            url: '/menu-click/open-settings'};
};

/**
 * Execute the command. Opens the 'Settings' window.
 */
OpenSettingsCommand.prototype.execute = function () {
    this.create('Window', {url: 'settings/index'});
};

/**
 * Undo the executed command.
 */
OpenSettingsCommand.prototype.undo = function () {

};

module.exports = OpenSettingsCommand;