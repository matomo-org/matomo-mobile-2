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
 * @class     A graph is created by the method Piwik.UI.createGraph. The graph UI widget displays a rendered graph.
 *            The graph will be rendered into a TableViewRow. Therefore, you need a TableView to display the rendered
 *            content. The rendered row is accessible via getRow(). Does automatically display an information that
 *            no data is available if graphUrl is not defined. If there are multiple graph urls (static and evolution)
 *            graphs, a toolbar will be added which allows the user to switch between different graphs.
 *
 * @param     {Object}  [params]             See {@link Piwik.UI.View#setParams}
 * @param     {string}  [params.imageGraphUrl]           Optional. The url to the static graph without any sizes
 * @param     {string}  [params.imageGraphEvolutionUrl]  Optional. The url to the evolution graph without any sizes
 * @param     {string}  [params.reportName]  An optional report nam.
 * @param     {string}  [params.reportName]  An optional report nam.
 * @param     {string}  [params.reportDate]  An optional report date
 *
 * @example
 * var graph = Piwik.getUI().createGraph({graphUrl: 'http://...'});
 * var row   = graph.getRow();
 * 
 * @exports   Graph as Piwik.UI.Graph
 * @augments  Piwik.UI.View
 */
function Graph () {
        
    /**
     * The width that should be used when displaying the graph.
     * 
     * @defaults  0
     * 
     * @type      int
     * 
     * @private
     */
    this.width = 0;
    
    /**
     * A reference to the image view which displays the graph.
     *
     * @type  Ti.UI.ImageView|null
     */
    this.graphImage = null;
    
    /**
     * A reference to the image view which displays the icon to open the graph in fullscreen.
     *
     * @type  Ti.UI.ImageView|null
     */
    this.showDetailImage = null;
    
    /**
     * A reference to the currently available graph urls as well as to the UI that renders the "Switch Graph" toolbar.
     *
     * @type  Piwik.UI.SwitchGraph|null
     */
    this.graphUrls = null;
}

/**
 * Extend Piwik.UI.View
 */
Graph.prototype = Piwik.require('UI/View');

/**
 * Initializes and renders the graph UI widget.
 *
 * @returns  {Piwik.UI.Graph}  An instance of the current state.
 */
Graph.prototype.init = function () {
    
    this.graphUrls = this.create('SwitchGraph', {imageGraphUrl: this.getParam('imageGraphUrl'), 
                                                 imageGraphEvolutionUrl: this.getParam('imageGraphEvolutionUrl')});

    if (!this.graphUrls.currentGraphUrl()) {
        Piwik.getLog().debug('No graphUrl given', 'Piwik.UI.Graph::init');

        var _    = require('library/underscore');
        this.row = Ti.UI.createTableViewRow({className: 'noDataForGraphTableViewRow',
                                             title: _('General_NoDataForGraph')});
        
        return this;
    }
    
    var view = Ti.UI.createTableViewRow({className: 'graphTableViewRow'});

    this.addGraph(view);
    
    if (this.graphUrls.canSwitch()) {
        this.addSwitchGraph(view);
    }

    this.row = view;
    view     = null;
    
    return this;
};

/**
 * Adds the possibility to switch between different kind of graphs to the given view.
 * 
 * @param  {Titanium.UI.View}  view  Any Titanium.UI.View object - for example Titanium.UI.TableViewRow where
 *                                   the "switch graph view" should be rendered into.
 */
Graph.prototype.addSwitchGraph = function (view) {
    
    var that = this;
    this.graphUrls.addSwitchGraph(view, false, true);
    
    this.graphUrls.addEventListener('switch', function (event) {
        if (!event || !event.graphUrl || !that || !that.graphImage) {
            return;
        }
        
        var graph     = Piwik.require('PiwikGraph');
        var isAndroid = Piwik.getPlatform().isAndroid;
        that.graphImage.image = graph.appendSize(event.graphUrl, that.getWidth(), that.getHeight(), !isAndroid);
        graph = null;
        
        that.graphUrls.toggleVisibility();
        that.showDetailImage.hide();
    });

    this.graphImage.addEventListener('click', function () {
        if (!that || !that.graphUrls) {
            return;
        }
        
        that.graphUrls.toggleVisibility();
    });
    
    if (Piwik.getPlatform().isAndroid) {
        this.graphUrls.fadeOut();
    } else {
        this.graphImage.addEventListener('load', function () {
            // we need to wait till view is visible otherwise animation will never be executed.
            if (!that || !that.graphUrls) {
                return;
            }
            
            that.graphUrls.fadeOut();
        });
    }

    view = null;
};

/**
 * Get the rendered content/row of the graph.
 * 
 * @type  Titanium.UI.TableViewRow
 */
Graph.prototype.getRow = function () {
    var row  = this.row;
    this.row = null;
    
    return row;
};

/**
 * Creates an image view to display the graph and adds it to the given view.
 *
 * @param  {Titanium.UI.View}  view  Any Titanium.UI.View object - for example Titanium.UI.TableViewRow where
 *                                   the graph image should be rendered into.
 */
Graph.prototype.addGraph = function (view) {

    Piwik.getLog().debug(this.graphUrls.currentGraphUrl(), 'Piwik.UI.Graph::addGraph');
    
    var graph     = Piwik.require('PiwikGraph');
    var isAndroid = Piwik.getPlatform().isAndroid;
    var graphUrl  = graph.appendSize(this.graphUrls.currentGraphUrl(), this.getWidth(), this.getHeight(), !isAndroid);
    graph         = null;

    this.graphImage = this.create('ImageView', {width: this.getWidth(),
                                                height: this.getHeight(),
                                                id: 'graphImage', 
                                                hires: true,
                                                visible: true,
                                                image: graphUrl});

    view.add(this.graphImage);

    var that = this;
    this.showDetailImage = Ti.UI.createImageView({className: 'graphShowDetailImage'});
    
    this.showDetailImage.addEventListener('click', function () {
        that.create('FullscreenWindow', {url: 'graph/fulldetail', 
                                         imageGraphUrl: that.getParam('imageGraphUrl'), 
                                         imageGraphEvolutionUrl: that.getParam('imageGraphEvolutionUrl'),
                                         reportName: that.getParam('reportName'), 
                                         reportDate: that.getParam('reportDate')});
    });
    
    view.add(this.showDetailImage);
    
    if (Piwik.getPlatform().isAndroid) {
        
        this.showDetailImage.animate({opacity: 0, delay: 600, duration: 600}, function () {
            if (!that || !that.showDetailImage) {
                return;
            }
            
            that.showDetailImage.hide();
            that.showDetailImage.opacity = 1;
        });
        
    } else {
        this.graphImage.addEventListener('load', function () {
            // we need to wait till view is visible otherwise animation will never be executed.
            if (!that || !that.showDetailImage) {
                return;
            }
            
            that.showDetailImage.animate({opacity: 0, delay: 600, duration: 600}, function () {
                if (!that || !that.showDetailImage) {
                    return;
                }
                
                that.showDetailImage.hide();
                that.showDetailImage.opacity = 1;
            });
        });
    }
    
    this.graphImage.addEventListener('click', function () {
        
        if (that && that.showDetailImage && that.showDetailImage.visible) {
            that.showDetailImage.hide();
        } else if (that && that.showDetailImage && !that.showDetailImage.visible) {
            that.showDetailImage.show();
        }
    })
    
    view = null;
};

/**
 * Gets the width of the graph. Does not recalculate the width each time you call this method. It'll always return the
 * same width. That means if orientation changes, it'll still return the same width. This is expected at the moment.
 */
Graph.prototype.getWidth = function () {
    
    if (this.width) {
        // use cached width, we do not want to recalculate it all the time.
        
        return this.width;
    }
    
    // @todo can we calculate the width depending on the outer view? width is only correct under circumstances.
    var width = Piwik.getUI().currentWindow.width;
    if (!width && Piwik.getUI().currentWindow.size) {
        width = Piwik.getUI().currentWindow.size.width;
    }

    this.width = '' + (parseInt(width, 10) - 2 - 40);
    
    return this.width;
};

/**
 * Gets the height of the graph.
 */
Graph.prototype.getHeight = function () {
    return '150';
};

/**
 * Cleanup.
 */
Graph.prototype.cleanup = function () {
    if (this.graphUrls && this.graphUrls.cleanup) {
        this.graphUrls.cleanup();
    }
    
    this.row   = null;
    this.width = 0;
    this.graphUrls  = null;
    this.graphImage = null;
    this.showDetailImage = null;
};

module.exports = Graph;