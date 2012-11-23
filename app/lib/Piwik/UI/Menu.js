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
 * @class     A menu is created by the method Piwik.UI.createMenu. Therefore, the menu adds buttons, icons, option menus
 *            to the current displayed window which allows to execute several actions. Like choosing another website.
 *            Each time another window gets the focus (by closing an existing window or opening a new window) it is
 *            possible to reset and rebuild the menu by calling the 'refresh' method.
 *
 * @param     {Object}  [params]           See {@link Piwik.UI.View#setParams}
 * @param     {string}  [params.commands]  Optional. An array containing command instances.
 *
 * @example
 * var menu = Piwik.getUI().createMenu();
 * menu.refresh({commands: [command1, command 2]});  // add two commands  to the window.
 * 
 * @exports   Menu as Piwik.UI.Menu
 * @augments  Piwik.UI.View
 */
function Menu () {

    /**
     * Currently only used on non iOS platforms. On iOS we use the native header as the menu view.
     * A view where all menu items like buttons or icons shall be added. For example the header.
     *
     * @type  Titanium.UI.View|null
     */
    this.menuView          = null;

    this.availableCommands = null;
}

/**
 * Extend Piwik.UI.View
 */
Menu.prototype = Piwik.require('UI/View');

/**
 * Initializes the menu.
 *
 * @returns  {Piwik.UI.Menu}  An instance of the current state.
 */
Menu.prototype.init = function () {

    this.menuView          = this.getParam('menuView');
    this.availableCommands = {};

    return this;
};

/**
 * Rebuild menu. Removes all previous displayed menu buttons and option menus. Adds the activated buttons and
 * Android Option Menu Items afterwards.
 *
 * @param  {Object}  params  See {@link Piwik.UI.Menu}
 *
 * @type   null
 */
Menu.prototype.refresh = function (params) {

    if (params) {
        this.setParams(params);
        params = null;
    }

    var win        = this.getParam('window', {});
    var commands   = this.getParam('commands', []);
    var rootWindow = win.rootWindow;

    if (Piwik.getPlatform().isIos) {
        var labels = [];
        
        for (var index = 0; index < commands.length; index++) {
            var command     = commands[index];
            var buttonLabel = command.getButtonLabel();

            if (!buttonLabel) {
                continue;
            }
            
            labels.push(buttonLabel);
            buttonLabel     = null;
        }
        
        if (this.toolBar) {
            this.toolBar.hide();
            
            if (rootWindow) {
                rootWindow.rightNavButton = null;
            }
        }

        // always reset left nav button, but not in iPad devices
        if (!Piwik.getPlatform().isIpad && rootWindow) {
            rootWindow.leftNavButton = null;
        }

        if (labels.length && rootWindow) {
            
            var that     = this;
            this.toolBar = null;
            this.toolBar = Ti.UI.createButtonBar({labels: labels, id: 'menuButtonBar'});

            rootWindow.rightNavButton = this.toolBar;

            this.toolBar.addEventListener('click', function (event) {
                if (!event || !event.source) {

                    return;
                }

                var buttons = event.source.labels;
                var button  = buttons[event.index];

                if (button && button.command) {

                    button.command.execute({source: that.toolBar});
                }
                
                buttons = null;
                button  = null;
            });
        } 

    } else if (this.menuView) {

        var stringUtils = Piwik.require('Utils/String');
        
        // android
        var right = 0;
        
        // remove previous added menu items
        for (var commandId in this.availableCommands) {
            var availableCommand = this.availableCommands[commandId];
            
            try {
                availableCommand.hide();
                this.menuView.remove(availableCommand);
                
                availableCommand                  = null;
                this.availableCommands[commandId] = null;
                
            } catch (e){ 
                Piwik.getLog().warn('Failed to remove a command from menuView: ' + e, 'Piwik.UI.Menu::refresh');
            }
        }
        
        this.availableCommands = {};
            
        for (var index = (commands.length - 1); -1 < index; index--) {
            var command  = commands[index];
            var menuIcon = command.getMenuIcon();
            
            if (!menuIcon) {
                continue;
            }
            
            // spacing should be always 8
            right      = right + 8;

            var icon   = Ti.UI.createImageView(menuIcon);
            icon.right = stringUtils.toSizeUnit('' + right);
            right      = right + parseInt(icon.width, 10);
            
            icon.addEventListener('click', (function (command) {
            
                return function () {
                    var menuEvent = command.getMenuTrackingEvent();
                    if (menuEvent) {
                        Piwik.getTracker().trackEvent(menuEvent);
                    }
    
                    command.execute();
                };
            })(command));
            
            this.availableCommands[command.getId()] = icon;
            this.menuView.add(icon);
            icon     = null;
            menuIcon = null;
        }

        stringUtils = null;
    }
    
    commands   = null;
    rootWindow = null;
    win        = null;
};

module.exports = Menu;