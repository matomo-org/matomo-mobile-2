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
 * @class     Send us feedback via email command.
 *
 * @exports   SendFeedbackCommand as Piwik.Command.SendFeedbackCommand
 * @augments  Piwik.UI.View
 */
function SendFeedbackCommand () {
}

/**
 * Extend Piwik.UI.View
 */
SendFeedbackCommand.prototype = Piwik.require('UI/View');

/**
 * Returns a unique id for this command.
 * 
 * @returns  {string}  The id of the command.
 */
SendFeedbackCommand.prototype.getId = function () {
    return 'sendFeedbackCommand';
};
    
/**
 * Get the label/title of the command which is intended to be displayed.
 * 
 * @returns  {string}  The label of the command.
 */
SendFeedbackCommand.prototype.getLabel = function () {
    return 'Email us';
};

/**
 * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
 * 
 * @returns  {Object}  The button label of the command.
 */
SendFeedbackCommand.prototype.getButtonLabel = function () {
    return {title: this.getLabel(), command: this};
};

/**
 * Get the menu icon definitions for this command.
 * 
 * @type  Object
 */
SendFeedbackCommand.prototype.getMenuIcon = function () {
    return {id: 'menuSendFeedbackIcon'};
};

/**
 * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
 * 
 * @type  Object
 */
SendFeedbackCommand.prototype.getMenuTrackingEvent = function () {
    return {title: 'Menu Click - Send Feedback',
            url: '/menu-click/send-feedback'};
};

/**
 * Execute the command. Opens an email dialog which already contains useful information about the device.
 */
SendFeedbackCommand.prototype.execute = function () {
    
    var emailDialog = Ti.UI.createEmailDialog();
    emailDialog.setSubject("Feedback Piwik Mobile");
    emailDialog.setToRecipients(['mobile@piwik.org']);

    if (emailDialog.setBarColor) {
        emailDialog.setBarColor('#B2AEA5');
    }

    if (!emailDialog.isSupported()) {
        var _ = require('library/underscore');
        Ti.UI.createAlertDialog({message: 'Please install an email app', ok: _('General_Ok')}).show();
        _ = null;

        return;
    }

    var platform   = String.format('Platform: %s %s %s', 
                                   '' + Ti.Platform.name, 
                                   '' + Ti.Platform.version, 
                                   '' + Ti.Platform.model);
    var version    = String.format("Version: %s - %s %s",
                                   '' + Ti.App.version,
                                   '' + Ti.version,
                                   '' + Ti.buildHash);
    var memory     = "Available memory: " + Ti.Platform.availableMemory;
    
    var caps       = Ti.Platform.displayCaps;
    var resolution = String.format("Resolution: %sx%s %s (%s)",
                                   '' + caps.platformWidth, 
                                   '' + caps.platformHeight, 
                                   '' + caps.density, 
                                   '' + caps.dpi);
    var locale     = String.format("Locale: %s", '' + Ti.Platform.locale);
    var network    = String.format("Network: %s", '' + Ti.Network.networkTypeName);

    var message = 'Your Message: \n\n\nYour Device: \n' + platform + '\n';
    message    += version + '\n' + memory + '\n' + resolution + '\n' + locale + '\n' + network;

    emailDialog.setMessageBody(message);

    emailDialog.addEventListener('complete', function (event) {

        if (Piwik.getPlatform().isIos && event && event.result && event.result == emailDialog.SENT) {
            // android doesn't give us useful result codes. it anyway shows a toast.
            
            var _ = require('library/underscore');
    
            Ti.UI.createAlertDialog({message: _('Feedback_ThankYou'), ok: _('General_Ok')}).show();
        }
    });

    emailDialog.open();
};

/**
 * Undo the executed command.
 */
SendFeedbackCommand.prototype.undo = function () {

};

module.exports = SendFeedbackCommand;