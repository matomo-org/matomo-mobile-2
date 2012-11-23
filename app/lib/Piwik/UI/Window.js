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
 * @class     Adds some further utilities like 'close' to a Titanium.UI.View.
 *
 * @exports   UiWindow as Piwik.UI.Window
 * @augments  Titanium.UI.View
 */
function UiWindow () {

    /**
     * This event will be fired before the window is getting closed.
     *
     * @name   Piwik.UI.Window#event:close
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     */

    /**
     * Header options that will be passed to refresh the header each time a window gets the focus. 
     *
     * @see  Piwik.UI.Header#refresh
     */
    this.titleOptions = {title: 'Piwik Mobile'};

    /**
     * Menu options that will be passed to refresh the menu each time a window gets the focus.
     *
     * @see  Piwik.UI.Menu#refresh
     */
    this.menuOptions  = {};

    /**
     * Counts how many items are removed within the cleanup method. Just for logging.
     *
     * @default  "0"
     *
     * @type     Number
     */
    this.removedItems = 0;

    /**
     * Prevents that the cleanup does not end in a never ending loop, cause the cleanup method will be called
     * recursive. The cleanup method will stop as soon as the max depth number has been reached. Just to be safe...
     *
     * @default  "6"
     *
     * @type     Number
     */
    this.maxDepth     = 6;
    
    var that = this;
    
    var mymempool = {
        cleanups: null,
        
        add: function (obj) {
            if (!this.cleanups) {
                this.cleanups = [];
            }
            
            this.cleanups.push(obj);
            obj = null;
        },
        
        release: function () {
            
            if (!this.cleanups || !this.cleanups.length) {
                
                return;
            }
            
            var len = this.cleanups.length;
            for (var index = 0; index < len; index++) {
            
                var rel = this.cleanups.pop();
                
                try {
                    if (rel && rel.cleanup) {
                        rel.cleanup();
                    }
                    
                    if (!rel) {
                        continue;
                    }
                } catch (e) {
                    Piwik.getLog().warn(e, 'Failed to cleanup rel ' + rel)
                }

                rel.window = null;
                rel.params = null;
                rel        = null;
            }
            
            this.cleanups  = null;
        }
    };

    this.addEventListener('focusWindow', function (event) {

        if (!that || !that.url) {
            Piwik.getLog().warn('url or window no longer exists, ignoring focus', 'Piwik.UI.Window::focusWindowEvent');
            
            return;
        }

        // do not track a page view if just a modal window was closed
        if (!event || 'undefined' == (typeof event.modal) || !event.modal) {
            // track a page view
            Piwik.getTracker().trackWindow(that.url);
        }

        // refresh the headline as well as the menu each time a window gets the focus.
        Piwik.getUI().layout.setHeader(that, that.titleOptions);
        Piwik.getUI().layout.setMenu(that, that.menuOptions);
    });
    
    this.create = function (widget, params) {
        
        if (!params) {
            params = {};
        }
        
        if (!params.window) {
            params.window = that;
        }
        
        var uiWidget = Piwik.getUI()['create' + widget](params);
        mymempool.add(uiWidget);
        
        params       = null;
        widget       = null;
        
        return uiWidget;
    };
    
    this.createCommand = function (commandName, params) {
        
        if (!params) {
            params = {};
        }
        
        if (!params.window) {
            params.window  = that;
        }
        
        var commandFactory = Piwik.require('Command');
        
        var command = commandFactory.create(commandName, params);
        params      = null;
        
        mymempool.add(command);
        
        return command;
    };

    /**
     * This method will be called each time a window will be opened. The method can also be used to reopen an already
     * opened window (refresh the window). When this method will be called, the UI widgets are already initialized.
     * The method is intended to request all required data (always asynchronous if possible) the window needs.
     */
    this.open = function () {
        // overwrite this within your window if needed.
    };
    
    /**
     * Closes the window in a safe way.
     *
     * @param  {boolean}  newWindowWillFollow  True if a new window will be opened afterwards. We do not close
     *                                         the app in such a case if no other views/windows are available.
     *
     * @fires  Piwik.UI.Window#event:close
     */
    this.close = function (newWindowWillFollow) {
        if ('undefined' == (typeof newWindowWillFollow) || !newWindowWillFollow) {
            newWindowWillFollow = false;
        }
    
        if (!Piwik.getPlatform().isIpad && Piwik.getPlatform().isIos && Piwik.getUI().layout.windows
            && 1 == Piwik.getUI().layout.windows.length && !newWindowWillFollow) {
            // If only 1 view is available do never close the first screen on iOS, otherwise a blank window will appear
    
            return;
        }
    
        this.fireEvent('closeWindow', {type: 'closeWindow'});
    
        try {
            // hide view so we make sure the view will no longer be visible, even if the later removeWindow does
            // not work
            this.hide();
            
            if (this.cleanup) {
                this.cleanup();
            }
            
            mymempool.release();
            that = null;
    
        } catch (e) {
            Piwik.getLog().warn('failed to remove view from window: ' + e.message, 'Piwik.UI.Window::close');
        }
    
        Piwik.getUI().layout.removeWindow(this, newWindowWillFollow);
    };
    
}

module.exports = UiWindow;