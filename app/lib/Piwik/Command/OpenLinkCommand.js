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
 * @class     Opens any URL, for example a website. It does also automatically track the given url.
 * 
 * @param     {Object}  [params]     See {@link Piwik.UI.View#setParams} 
 * @param     {string}  params.link  Any URL, for example 'http://www.example.com/path' or 'market://details?id=...'.
 *
 * @exports   OpenLinkCommand as Piwik.Command.OpenLinkCommand
 * @augments  Piwik.UI.View
 */
function OpenLinkCommand () {
}

/**
 * Extend Piwik.UI.View
 */
OpenLinkCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
OpenLinkCommand.prototype.getId = function () {
    return 'openLinkCommand';
};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
OpenLinkCommand.prototype.getLabel = function () {
    return '';
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
OpenLinkCommand.prototype.getButtonLabel = function () {};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
OpenLinkCommand.prototype.getMenuIcon = function () {};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
OpenLinkCommand.prototype.getMenuTrackingEvent = function () {};

/**
 * Execute the command. Opens the 'Settings' window.
 */
OpenLinkCommand.prototype.execute = function () {
    
    var link = this.getParam('link', '');
    
    if (!link) {
        
        return;
    }
    
    try {
        Piwik.getTracker().trackLink(link, 'link');
        Ti.Platform.openURL(link);
    } catch (e) {
        
        Piwik.getLog().warn('Failed to open url: ' + url + ': ' + e.message, 'Piwik.Command.OpenLinkCommand::execute');
    }
};

/**
 * Undo the executed command.
 */
OpenLinkCommand.prototype.undo = function () {

};

module.exports = OpenLinkCommand;