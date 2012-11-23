/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     A switch graph is created by the method Piwik.UI.createSwitchGraph. The switch graph UI widget adds a
 *            toolbar to any view and allows to switch between multiple graphs. There's also the possibility to 
 *            render a close button within the toolbar. The chosen graph type (static or evolution) will be stored in
 *            application settings.
 *
 * @param     {Object}  [params]                         See {@link Piwik.UI.View#setParams}
 * @param     {string}  [params.imageGraphUrl]           Optional. The url to the static graph without any sizes
 * @param     {string}  [params.imageGraphEvolutionUrl]  Optional. The url to the evolution graph without any sizes
 *
 * @example
 * var graph = Piwik.getUI().createSwitchGraph({imageGraphUrl: 'http://...', imageGraphEvolutionUrl: 'http://...'});
 * if (graph.canSwitch()) {
 *     graph.addSwitchGraph(view, true, false);
 *     graph.addEventListener('switch', function (event) { alert(event.graphUrl); });
 * }
 * 
 * @exports   SwitchGraph as Piwik.UI.SwitchGraph
 * @augments  Piwik.UI.View
 */
function SwitchGraph () {
        
    /**
     * Fired if the user switches to another graph.
     *
     * @name   Piwik.UI.SwitchGraph#event:switch
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type       The name of the event.
     * @param  {string}  event.graphUrl   An absolute url of the graph which should be displayed now.
     */
        
    /**
     * Fired if the close button was tapped.
     *
     * @name   Piwik.UI.SwitchGraph#event:close
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     */
    
    /**
     * The absoulte url of the static image graph.
     * 
     * @defaults  ""
     * 
     * @type      string
     * 
     * @private
     */
    this.staticUrl    = '';
        
    /**
     * The absoulte url of the evolution image graph.
     * 
     * @defaults  ""
     * 
     * @type      string
     * 
     * @private
     */
    this.evolutionUrl = '';
    
    /**
     * The url of the graph that should be currently displayed.
     * 
     * @defaults  ""
     * 
     * @type      string
     * 
     * @private
     */
    this.currentUrl   = '';
    
    /**
     * The toolbar/container that contains all buttons to switch between graphs and to close the window. On iOS this
     * is a Toolbar UI widget, on Android this is a View UI Widget.
     *
     * @type  null|Ti.UI.View|Ti.UI.iOS.Toolbar
     */
    this.toolbar = null;
}

/**
 * Extend Piwik.UI.View
 */
SwitchGraph.prototype = Piwik.require('UI/View');
    
/**
 * Initializes this UI widget by getting the given urls and detecting the preferred graph url (evolution or static).
 */
SwitchGraph.prototype.init = function () {
    this.staticUrl    = this.getParam('imageGraphUrl', '');
    this.evolutionUrl = this.getParam('imageGraphEvolutionUrl', '');
    this.currentUrl   = this.getPreferredGraphUrl();
};

/**
 * Gets the current active graph url.
 *
 * @returns  {string}  The currently active graph url. Either a static or an evolution graph url.
 */
SwitchGraph.prototype.currentGraphUrl = function () {
    
    return this.currentUrl;
};

/**
 * Switches/Changes the pointer to the next graph url and returns the url. Example: If static graph is currently active
 * it'll switch to the evolution graph and return the url of the evolution graph. Automatically stores the chosen
 * preference in the user settings.
 *
 * @returns  {string}  The switched graph url. Either a static or an evolution graph url.
 */
SwitchGraph.prototype.nextGraphUrl = function () {

    if (this.currentUrl == this.staticUrl) {
        this.currentUrl = this.evolutionUrl;
        
        Piwik.require('App/Settings').setPreferEvoltuionGraphs(true);
        Piwik.getTracker().trackEvent({title: 'Switch Graph Static', url: '/graph/switch/static'});
        
    } else if (this.currentUrl == this.evolutionUrl) {
        this.currentUrl = this.staticUrl;
        
        Piwik.require('App/Settings').setPreferEvoltuionGraphs(false);
        Piwik.getTracker().trackEvent({title: 'Switch Graph Evolution', url: '/graph/switch/evolution'});
    }
    
    return this.currentUrl;
};

/**
 * Gets the name of the graph type that is currently not active. This is either "Evolution Graph" or "Static Graph".
 * Example: If static graph is currently active, you'll get "Evolution Graph". Can be used to display the name of the
 * graph type in a button.
 *
 * @returns  {string}  The name of the graph type that is currently not active.
 */
SwitchGraph.prototype.getNextGraphType = function () {

    if (this.currentUrl == this.evolutionUrl) {
        return _('Mobile_StaticGraph');
    }
    
    return _('Mobile_EvolutionGraph');
};

/**
 * Gets the preferred graph url. This will be either a static or an evolution graph url. If only one url is set, that
 * url will be returned. If both urls are set, the preferred graph url is chosen depending on the user setting.
 *
 * @returns  {string}  The url of the preferred graph.
 */
SwitchGraph.prototype.getPreferredGraphUrl = function () {

    if (!this.evolutionUrl && this.staticUrl) {
        return this.staticUrl;
        
    } else if (!this.staticUrl && this.evolutionUrl) {
        return this.evolutionUrl;
        
    } else if (!this.staticUrl && !this.evolutionUrl) {
        return '';
    } 
    
    if (Piwik.require('App/Settings').getPreferEvoltuionGraphs()) {
        
        return this.evolutionUrl;
    }
    
    return this.staticUrl;
};

/**
 * Detects whether at least two different graph urls are set.
 *
 * @returns  {boolean}  true if the user can switch between multiple graphs, false otherwise.
 */
SwitchGraph.prototype.canSwitch = function () {
    
    if (this.staticUrl == this.evolutionUrl) {
        // this happens for example in "Visits Summary" report
        
        return false;
    }

    return this.staticUrl && this.evolutionUrl;
};

/**
 * Adds a simple toolbar to the given window/view containing a button which allows to switch between graphs. The toolbar
 * will be only added if there are at least two different graph urls.
 *
 * @param  {Piwik.UI.Window|Ti.UI.View}  win  The toolbar will be rendered into this view or window.
 * 
 * @fires  Piwik.UI.SwitchGraph#event:switch
 * 
 * @private
 */
SwitchGraph.prototype._addSwitchGraphAndroid = function (win) {
    
    if (!this.canSwitch()) {
        win = null;
        
        return;
    }

    var that = this;
    
    this.toolbar = Ti.UI.createView({className: 'graphSwitchGraphContainerView', opacity: 0.9, visible: true});
    win.add(this.toolbar);
    win = null;
    
    var switchGraphButton = Ti.UI.createButton({title: this.getNextGraphType(), className: 'graphSwitchGraphButton'});
    this.toolbar.add(switchGraphButton);

    switchGraphButton.addEventListener('click', function () {
        
        if (!that) {
            return;
        }
        
        // event to switch between normal and evolution graph
        that.fireEvent('switch', {type: 'switch', graphUrl: that.nextGraphUrl()});
        
        this.title = that.getNextGraphType();
    });
    
    switchGraphButton = null;
};

/**
 * Fades the switch graph view out.
 */
SwitchGraph.prototype.fadeOut = function () {
    var that = this;
    this.toolbar.animate({opacity: 0, delay: 600, duration: 600}, function () {

        if (!that || !that.toolbar) {
            
            return;
        }

        that.toolbar.hide();
        that.toolbar.opacity = Piwik.getPlatform().isAndroid ? 0.9 : 0.7
        that = null;
    });
}


/**
 * Adds a simple toolbar to the given window/view containing a button which allows to switch between graphs and a button
 * to close the window. The button to switch between graphs will be only added if there are at least two different 
 * graph urls.
 *
 * @param  {Piwik.UI.Window|Ti.UI.View}  win         The toolbar will be rendered into this view or window.
 * @param  {boolean}                     showCloseButton  Whether a close button should be displayed or not. On Android
 *                                                        a close button will not be displayed as there is a hardware
 *                                                        key for that.
 * 
 * @fires  Piwik.UI.SwitchGraph#event:switch
 * @fires  Piwik.UI.SwitchGraph#event:close
 */
SwitchGraph.prototype.addSwitchGraph = function (win, showCloseButton) {

    if (Piwik.getPlatform().isAndroid) {
       this._addSwitchGraphAndroid(win);
       win = null;
        
       return;
    }
    
    var that         = this;
    var toolbarItems = [];
    
    if (showCloseButton) {
        var closeButton = Ti.UI.createButton({title: _('General_Close'),
                                              style: Ti.UI.iPhone.SystemButtonStyle.BORDERED,
                                              color: '#333333'});
    
        closeButton.addEventListener('click', function () {
            if (!that) {
                return;
            }
            
            that.fireEvent('close', {type: 'close'});
        });
        
        toolbarItems.push(closeButton);
        closeButton = null;
    }

    toolbarItems.push(Ti.UI.createButton({systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE}));
    
    if (this.canSwitch()) {

        var switchGraphButton = Ti.UI.createButton({title: this.getNextGraphType(),
                                                    style: Ti.UI.iPhone.SystemButtonStyle.BAR,
                                                    color: '#333333'});
        
        switchGraphButton.addEventListener('click', function () {
            if (!that) {
                
                return;
            }
            
            // event to switch between normal and evolution graph
            that.fireEvent('switch', {type: 'switch', graphUrl: that.nextGraphUrl()});
    
            this.title = that.getNextGraphType();
        });
        
        toolbarItems.push(switchGraphButton);
        switchGraphButton = null;
    }
   
    this.toolbar = Ti.UI.iOS.createToolbar({items: toolbarItems,
                                            opacity: 0.7,
                                            className: 'graphSwitchGraphToolbar',
                                            visible: true});
    
    win.add(this.toolbar);
    
    win = null;
    
    for (var index in toolbarItems) {
        toolbarItems[index] = null;
    }
    
    toolbarItems = null;
};

/**
 * Toggles the visibility of the toolbar. If toolbar is currently hidden, it'll be displayed afterwards. If toolbar is
 * currently displayed, it'll be hidden afterwards.
 */
SwitchGraph.prototype.toggleVisibility = function () {
    if (this.toolbar && this.toolbar.visible) {
        this.toolbar.hide();
    } else if (this.toolbar && !this.toolbar.visible) {
        this.toolbar.show();
    }
};

/**
 * Cleanup.
 */
SwitchGraph.prototype.cleanup = function () {
    this.toolbar = null;
};

module.exports = SwitchGraph;