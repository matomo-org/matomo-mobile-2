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
 * @class    The top level Command module. The module contains methods to create commands.
 *
 * @exports  Command as Piwik.Command
 * @static
 */
var Command = {};

/**
 * Creates an instance of the given command and automatically sets the given parameters.
 * 
 * @param    {string}       commandName  The name of the command, such a command has to exist within the 
 *                                       library/Piwik/Command folder. For example 'AddAccountCommand'.
 * @param    {Object}       params       Optional parameters which will be automatically set.
 *
 * @returns  {null|Object}  An instance of the created command or null if there was any error.
 */
Command.create = function (commandName, params) {
        
    if (!params) {
        params = {};
    }
    
    try {
        var commandInstance = Piwik.require('Command/' + commandName);
        
        if (!commandInstance) {
            return;
        }
        
        commandInstance.setParams(params);
        params = null;
        
    } catch (e) {
        Piwik.getLog().warn('Failed to create command: ' + e, 'Piwik.UI.Window::createCommand');
        
        return;
    }
    
    return commandInstance;
};

module.exports = Command;