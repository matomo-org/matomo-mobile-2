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
 * @class     A modal window is created by the method Piwik.UI.createModalWindow. The modal window UI widget
 *            opens a new window. On Android as well as on iPhone it will open a modal window, on the iPad it'll open
 *            a PopOver.
 *
 * @param     {Object}  params           See {@link Piwik.UI.View#setParams}
 * @param     {Object}  params.title     The title of the window
 * @param     {string}  params.openView  An instance of a Titanium UI Widget, for example a view, button, etc. This is 
 *                                       needed to open the PopOver. The arrow of the PopOver (iPad) will point to 
 *                                       this UI widget. If this view is not  given, the PopOver will not be opened on 
 *                                       iPad or the app will crash.
 *
 * @example
 * var win = Piwik.getUI().createModalWindow({title: 'MyWindow', openView: toolBar});
 * win.add(something);
 * win.open();
 * win.close();
 *
 * @exports   ModalWindow as Piwik.UI.ModalWindow
 * @augments  Piwik.UI.View
 */
function ModalWindow () {
    
    /**
     * A simple count var. Is used to count how often the window open method was executed. It should prevent
     * that we end in a never ending loop.
     * 
     * @defaults  0
     * 
     * @type      int
     * 
     * @private
     */
    this._counter = 0;

    /**
     * @private
     */
    this.win      = null;
    
    /**
     * Defines into which view other views shall be added
     * 
     * @private
     */
    this.viewToAddOtherViews = null;
}

/**
 * Extend Piwik.UI.View
 */
ModalWindow.prototype = Piwik.require('UI/View');

/**
 * Initializes the UI widget. Creates the window depending on the current platform.
 */
ModalWindow.prototype.init = function () {
    
    var that  = this;
    var title = this.getParam('title', '');
    var win   = null;

    if (Piwik.getPlatform().isIpad && Ti.UI.iPad) {
        win   = Ti.UI.iPad.createPopover({width: 320, height: 460, title: title});
        
        this.viewToAddOtherViews = win;
        
        win.addEventListener('hide', function () {
            that.viewToAddOtherViews = null;
            that.win                 = null;
            that.params              = null;
            that.window              = null;
            that                     = null;
        });
                                        
    } else if (Piwik.getPlatform().isIos) {

        win   = Ti.UI.createWindow({className: 'modalWindow',
                                    modal: true,
                                    barColor: '#B2AEA5',
                                    title: title});
                                   
        this.viewToAddOtherViews = win;

        var _             = require('library/underscore');
        var cancelButton  = Ti.UI.createButton({title: _('SitesManager_Cancel_js'),
                                                style: Ti.UI.iPhone.SystemButtonStyle.CANCEL});
        _ = null;

        cancelButton.addEventListener('click', function () {
            if (that) {
                that.close();
            }
        });

        win.leftNavButton = cancelButton;
        cancelButton      = null;
        
        win.addEventListener('close', function () {
            if (!that) {
                
                return;
            }
            
            that.modalWindowIsNowClosed();
            
            that.fireEventInWindow('focusWindow', {type: 'focusWindow', modal: true});
            that = null;
        });

    } else if (Piwik.getPlatform().isAndroid) {

        var crt  = Ti.UI.currentWindow;
        win      = Ti.UI.createWindow({className: 'modalWindow', title: title});
        var view = Ti.UI.createView({backgroundColor: '#fff'});
        
        this.viewToAddOtherViews = view;

        win.add(view);
        view = null;
        
        win.addEventListener('android:back', function () {
           if (that) {
               that.close();
           }
        });

        win.addEventListener('close', function () {
        
            // don't know why but we have to restore the currentWindow reference on modal window close
            // @todo check whether we still have to do this.
            Ti.UI.currentWindow = crt;
            
            that.fireEventInWindow('focusWindow', {type: 'focusWindow', modal: true});
            that = null;
            crt  = null;
        });
    }
    
    this.win = win;
    win      = null;
};

/**
 * Add an event listener to receive triggered events.
 *
 * @param  {string}    name      Name of the event you want to listen to.
 * @param  {Function}  callback  Callback function to invoke when the event is fired.
 */
ModalWindow.prototype.addEventListener = function (name, callback) {
    if (!this.win || !name || !callback) {
        
        return;
    }
    
    if ('close' == name && Piwik.getPlatform().isIpad) {
        // the event name for popover on iPad is not 'close', it's 'hide'
        name = 'hide';
    }
    
    this.win.addEventListener(name, callback);
    
    name     = null;
    callback = null;
};

/**
 * Add a child to the view hierarchy.
 * 
 * @param  {Titanium.UI.View}  view  The view to add to this views hiearchy
 */
ModalWindow.prototype.add = function (view) {
    this.getView().add(view);
    view = null;
};

/**
 * Remove a child from the view hierarchy.
 * 
 * @param  {Titanium.UI.View}  view  The view to remove from this views hiearchy
 */
ModalWindow.prototype.remove = function (view) {
    if (!this.getView()) {
        Piwik.getLog().warn('View no longer exists to remove other view', 'Piwik.UI.ModalWindow::remove');
        view = null;
        
        return;
    }
    
    if (!view) {
        Piwik.getLog().warn('View is not set, cannot remove view', 'Piwik.UI.ModalWindow::remove');
        view = null;
        
        return;
    }
    
    this.getView().remove(view);
    view = null;
};

/**
 * View to show in the right nav bar area. Only available in iPhone.
 * 
 * @param  {Titanium.UI.View}  view  The view that shall be displayed in the right nav bar area.
 */
ModalWindow.prototype.setRightNavButton = function (view) {
    
    if (!Piwik.getPlatform().isIos) {
        
        return;
    }
    
    this.win.setRightNavButton(view);
    view = null;
};

/**
 * Get the view where everything shall be rendered into. For example on Android, the content should not directly
 * rendered into the modal window.
 * 
 * @returns  {Titanium.UI.View|Titanium.UI.Window}  An instance of the opened window or view.
 */
ModalWindow.prototype.getView = function () {
    return this.viewToAddOtherViews;
};

/**
 * Open the modal window or popover. You have to call this. Otherwise the content will not be visible.
 */
ModalWindow.prototype.open = function () {
    
    if (!this.win) {
        
        return;
    }
   
    if (this.isAModalWindowOpened() && this._counter < 7) {
        this._counter++;
        // the app will crash if we open a modal window while another modal window is opened or not completely 
        // closed. So wait another 300 ms. Execute the timeout max 7 times.
        
        var that = this;
        setTimeout(function () {
            that.open();
        }, 300);
        
        return;
    }
    
    this._counter = 0;
    
    this.modalWindowIsNowOpened();
    
    if (Piwik.getPlatform().isIpad) {
        
        if (!this.getParam('openView')) {
            
            Piwik.getLog().warn('No view given to open iPad PopOver', 'Piwik.UI.ModalWindow::open');
            return;
        }
        
        this.win.show({view: this.getParam('openView')});
    } else {
    
        this.fireEventInWindow('blurWindow', {type: 'blurWindow', modal: true});
        
        this.win.open({modal: true});
    }
};

/**
 * Detects whether there is currently a modal window opened. Unless a modal window is opened, we should not 
 * open another modal window on iPhone. Otherwise the app crashes.
 * 
 * @returns  {bool}  true if there is already a modal window opened, false otherwise.
 */
ModalWindow.prototype.isAModalWindowOpened = function () {
    
    if (!Piwik.getPlatform().isIphone) {
        // we only have to handle this on iPhone
        return false;
    }
    
    return Piwik.require('App/Session').get('modal_window_opened', false);
};

/**
 * Mark that the modal window is no longer opened.
 */
ModalWindow.prototype.modalWindowIsNowClosed = function () {
    if (Piwik.getPlatform().isIphone) {
        
        Piwik.require('App/Session').set('modal_window_opened', false);
    }
};

/**
 * Mark that a modal window is now opened.
 */
ModalWindow.prototype.modalWindowIsNowOpened = function () {
    if (Piwik.getPlatform().isIphone) {
        
        Piwik.require('App/Session').set('modal_window_opened', true);
    }
};

/**
 * Close an already opened window/popover.
 */
ModalWindow.prototype.close = function () {

    try {
        
        if (this.win && (Piwik.getPlatform().isAndroid || Piwik.getPlatform().isIphone)) {
            // window
            this.win.close();
        } else if (this.win && Piwik.getPlatform().isIpad) {
            // popover
            this.win.hide();
        }
        
    } catch (e) {
        Piwik.getLog().warn('Failed to close site chooser window', 'Piwik.UI.ModalWindow::onChooseSite');
    }
};

/**
 * Cleanup.
 */
ModalWindow.prototype.cleanup = function () {
    this.viewToAddOtherViews = null;
    this.win                 = null;
    this.params              = null;
    this.window              = null;
};

module.exports = ModalWindow;