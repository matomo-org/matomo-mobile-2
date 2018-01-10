/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

var message   = "Please, contact mobile@matomo.org or visit https://matomo.org/mobile\n";
var exception = args.error;

message      += "Error: ";
if ('undefined' !== (typeof exception) && exception) {
    message  += exception.toString();
    console.warn(exception.toString(), 'error_message_controller');
} else {
    message  += 'Unknown';
}

message += "\nPlease, provide the following information:\n";
message += "System: " + Ti.Platform.name + ' ' + Ti.Platform.version + "\n";

message += String.format("Matomo Mobile Version: %s - %s %s\n",
                         '' + require('Piwik').getAppVersion(), '' + Ti.version, '' + Ti.buildHash);
message += "Available memory " + Ti.Platform.availableMemory + "\n";

var caps =  Ti.Platform.displayCaps;
message += String.format("Resolution: %sx%s %s (%s) \n",
                         '' + caps.platformWidth,
                         '' + caps.platformHeight,
                         '' + caps.density,
                         '' + caps.dpi);

exports.open = function()
{
    var alertDialog = Ti.UI.createAlertDialog({
        title: "An error occurred",
        message: message,
        buttonNames: ['OK']
    });

    alertDialog.show();
};