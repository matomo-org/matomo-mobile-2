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
 * @class    The top level UI module. The module contains methods to create UI widgets and to handle the layout as well
 *           as the current window.
 *
 * @exports  UI as Piwik.UI
 * @static
 */
var UI = {};

/**
 * Points to the current opened Piwik window if one is opened. Null otherwise.
 *
 * @type  null|Piwik.UI.Window
 */
UI.currentWindow = null;

/**
 * Points to the application layout. The layout can be bootstrapped via the bootstrap() method. Is null if no layout
 * was previously bootstrapped.
 *
 * @type  null|Object
 */
UI.layout        = null;

/**
 * Bootstrap the UI / Layout.
 *
 * @param  {Object}  [options]
 * @param  {Object}  [options.layoutUrl]  Optional. Absolute url to the Piwik layout. If given, it immediately
 *                                        initializes the layout.
 */
UI.bootstrap = function (options) {
    
    var layout;

    if (options && options.layoutUrl) {
        
        layout      = Piwik.requireWindow(options.layoutUrl);
        this.layout = new layout();

        this.layout.init();
    }
    
    options = null;
    layout  = null;
};

/**
 * Creates a new window and displays it in front of the currently displayed window. Therefore it creates a new
 * Titanium.UI.View. The specified url defines which content is displayed within the window.
 * Titanium differences between lightweight and heavyweight windows. We don't use heavyweight windows cause heavyweight
 * windows has there own JavaScript subcontext. It is much faster to just work with one context. The disadvantage is
 * that we have to care a bit more about leaks and so on.
 *
 * @param  {Object}           params                      All needed params to display the window and process the 
 *                                                        request.
 * @param  {string}           params.url                  The url to the window with the windows instructions. The url
 *                                                        has to be relative to the 'Resources/windows' directory.
 * @param  {string}           [params.exitOnClose=false]  if true, it makes sure android exits the app when this
 *                                                        window is closed and no other activity (window) is running
 * @param  {string}           [params.target]             Only for iPad. Defines whether the window shall be placed in
 *                                                        'detailView', 'masterView' or 'modal' window.
 * @param  {Piwik.UI.Window}  [params.closeWindow]        If true, it closes the given window.
 * @param  {*}                params.*                    You can pass other parameters as you need it. The created
 *                                                        controller and view can access those values. You can use
 *                                                        this for example if you want to pass a site, date, period
 *                                                        parameter or something else. You can also use all
 *                                                        'Titanium.UI.Window' parameters.
 *
 *
 * @see      <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.Window-object">Titanium.UI.Window</a>
 *
 * @type     Piwik.UI.Window
 * 
 * @returns  The created window instance.
 */
UI.createWindow = function (params) {

    if (!params) {
        params = {};
    }
    
    params.window     = null;
    params.rootWindow = null;
    delete params.window;
    delete params.rootWindow;

    try {
        var url            = params.url;

        // increase the zIndex, ensures the next window will be displayed in front of the current window
        this.layout.zIndex = this.layout.zIndex + 1;
        params.zIndex      = this.layout.zIndex;
        params.className   = 'piwikWindow';

        // newWin is the view we will render everything into
        var newWin         = Ti.UI.createView(params);

        // delete params.className cause we just need it for view creation.
        delete params.className;

        // load the requested template
        var winTemplate    = Piwik.requireWindow(url);

        var window         = require('library/Piwik/UI/Window');
     
        // extend newWin
        window.apply(newWin, []);

        if (params.closeWindow) {
            params.closeWindow.close(true);
            params.closeWindow = null;
        }

        // add window to layout so that it will be visible afterwards
        this.layout.addWindow(newWin);

        // extend newWin again and render the requested template
        winTemplate.apply(newWin, [params]);
        
        newWin.fireEvent('beforeOpen', {});

        // open the new window. At this moment, the basic window is rendered and we just have to request the data
        // (async if possible).
        newWin.open(params);

        if (newWin.focus) {
            newWin.focus();
        }
        
        window      = null;
        params      = null;
        winTemplate = null;

        return newWin;

    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiCw12'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new full window and displays it in front of the currently displayed window. Therefore it creates a new
 * Titanium.UI.Window. The specified url defines which content is displayed within the window.
 * Titanium differences between lightweight and heavyweight windows. We don't use heavyweight windows cause heavyweight
 * windows has there own JavaScript subcontext. It is much faster to just work with one context. The disadvantage is
 * that we have to care a bit more about leaks and so on.
 *
 * @param  {Object}           params                      All needed params to display the window and process the 
 *                                                        request.
 * @param  {string}           params.url                  The url to the window with the windows instructions. The url
 *                                                        has to be relative to the 'Resources/windows' directory.
 * @param  {string}           [params.exitOnClose=false]  if true, it makes sure android exits the app when this
 * @param  {*}                params.*                    You can pass other parameters as you need it. The created
 *                                                        view can access those values. You can use this for example if 
 *                                                        you want to pass a site, date, period parameter or something 
 *                                                        else.
 *
 * @see      <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.Window-object">Titanium.UI.Window</a>
 */
UI.createFullscreenWindow = function (params) {

    if (!params) {
        params = {};
    }
    
    params.window     = null;
    params.rootWindow = null;
    delete params.window;
    delete params.rootWindow;

    try {
        var winParams = {opacity: 0, backgroundColor: 'white'};
        
        if (Piwik.getPlatform().isIpad) {
            // we do not support orientation on iPad at this moment
            winParams.orientationModes = [Ti.UI.orientation];
        } else if (Piwik.getPlatform().isAndroid) {
            // animation not supported by android, zIndex makes sure window is visible
            winParams.opacity = 1;
            winParams.zIndex  = 9999;
        } 
    
        // newWin is the will we will render everything into
        var newWin = Ti.UI.createWindow(winParams);
        newWin.open({opacity: 1, duration: 400});
        
        if (Piwik.getPlatform().isAndroid) {
            newWin.addEventListener('androidback', function () {
                Piwik.getLog().debug('android:back event', 'Piwik.UI::createFullscreenWindow');
            
                if (newWin) {
                    newWin.close();
                }
            });
        }
        
        var urlParams = ('' + params.url).split('/');
        Piwik.getTracker().trackEvent({title: urlParams[0] + ' ' + urlParams[1], url: '/' + params.url});
    
        // load the requested template
        var winTemplate = Piwik.requireWindow(params.url);
        // extend newWin and render the requested template
        winTemplate.apply(newWin, [params]);
        
        newWin.addEventListener('close', function () {
            Piwik.getLog().debug('close', 'Piwik.UI::createFullscreenWindow');
        
            if (newWin && newWin.cleanup) {
                newWin.cleanup();
                newWin = null;
            }
        });
        
        params      = null;
        winTemplate = null;

    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiFw23'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new modal window instance.
 *
 * @see      Piwik.UI.ModalWindow
 *
 * @param    {Object}  params  A dictionary object properties defined in  Piwik.UI.ModalWindow.
 *
 * @type     Piwik.UI.ModalWindow
 *
 * @returns  The created modal window instance.
 */
UI.createModalWindow = function (params) {

    try {
        var instance = Piwik.require('UI/ModalWindow');
        instance.setParams(params);
        instance.init();
        
        params = null;
        
        return instance;

    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiMw17'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new date picker instance.
 *
 * @see      Piwik.UI.DatePicker
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.DatePicker.
 *
 * @type     Piwik.UI.DatePicker
 *
 * @returns  The created date picker instance.
 */
UI.createDatePicker = function (params) {

    if (!params) {
        params  = {};
    }

    try {
        
        var module   = 'UI/DatePicker';
        if (Piwik.getPlatform().isIos) {
            module   = 'UI/DatePickerIos';
        }

        params.type  = Ti.UI.PICKER_TYPE_DATE;
        var picker   = Piwik.require(module);

        picker.setParams(params);

        var instance = picker.init(params);
        
        params       = null;
        picker       = null;
        
        return instance;
        
    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiDp16'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new TableView.
 *
 * @see      Piwik.UI.TableView
 *
 * @param    {Object}  params  A dictionary object properties defined in  Piwik.UI.TableView.
 *
 * @type     Titanium.UI.TableView
 *
 * @returns  The created tableview.
 */
UI.createTableView = function (params) {

    try {
        var instance = Piwik.require('UI/TableView');
        
        instance.setParams(params);
        instance.init();
        
        params       = null;
        
        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiTv25'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new TableViewRow.
 *
 * @see      Piwik.UI.TableViewRow
 *
 * @param    {Object}  params  A dictionary object properties defined in  Piwik.UI.TableViewRow.
 *
 * @type     Titanium.UI.TableViewRow
 *
 * @returns  The created row.
 */
UI.createTableViewRow = function (params) {

    try {
        var instance = Piwik.require('UI/TableViewRow');
        var row      = instance.init(params);
        
        instance     = null;
        params       = null;
        
        return row;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiTr11'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new TableViewSection.
 *
 * @see      Piwik.UI.TableViewSection
 *
 * @param    {Object}  params  A dictionary object properties defined in  Piwik.UI.TableViewSection.
 *
 * @type     Titanium.UI.TableViewSection
 *
 * @returns  The created section.
 */
UI.createTableViewSection = function (params) {

    try {
        var instance = Piwik.require('UI/TableViewSection');
        var section  = instance.init(params);
        
        instance     = null;
        params       = null;
        
        return section;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiTs21'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new activity indicator instance.
 *
 * @see      Piwik.UI.ActivityIndicator
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Error.
 *
 * @type     Piwik.UI.ActivityIndicator
 *
 * @returns  The created activity indicator instance.
 */
UI.createActivityIndicator = function (params) {

    try {
        var instance = Piwik.require('UI/ActivityIndicator');
        instance.setParams(params);
        instance.init();
        
        params = null;
        
        return instance;
        
    } catch (exception) {
        
        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiCa27'});
        uiError.showErrorMessageToUser();
    }

    return {};
};

/**
 * Creates a new UI error instance.
 *
 * @see      Piwik.UI.Error
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Error.
 *
 * @type     Piwik.UI.Error
 *
 * @returns  The created UI error instance.
 */
UI.createError = function (params) {

    try {
        var instance = Piwik.require('UI/Error');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;
        
    } catch (exception) {
        Piwik.getLog().warn('Failed to create Error UI widget', 'UI::createError');
    }

    return {showErrorMessageToUser: function () {}};
};

/**
 * Creates a new graph instance.
 *
 * @see      Piwik.UI.Graph
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Graph.
 *
 * @type     Piwik.UI.Graph
 *
 * @returns  The created graph instance.
 */
UI.createGraph = function (params) {

    try {
        var instance = Piwik.require('UI/Graph');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiCg27'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new switch graph instance.
 *
 * @see      Piwik.UI.SwitchGraph
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.SwitchGraph.
 *
 * @type     Piwik.UI.SwitchGraph
 *
 * @returns  The created switch graph instance.
 */
UI.createSwitchGraph = function (params) {

    try {
        var instance = Piwik.require('UI/SwitchGraph');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiSg51'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new statistic list instance.
 *
 * @see      Piwik.UI.StatisticList
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.StatisticList.
 *
 * @type     Piwik.UI.StatisticList
 *
 * @returns  The created statistic list instance.
 */
UI.createStatisticList = function (params) {

    try {
        var instance = Piwik.require('UI/StatisticList');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiSl30'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new statistic list entry instance.
 *
 * @see      Piwik.UI.StatisticListEntry
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.StatisticListEntry.
 *
 * @type     Piwik.UI.StatisticListEntry
 *
 * @returns  The created statistic list entry instance.
 */
UI.createStatisticListEntry = function (params) {

    try {
        var instance = Piwik.require('UI/StatisticListEntry');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiSe41'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new header instance.
 *
 * @see      Piwik.UI.Header
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Header.
 *
 * @type     Piwik.UI.Header
 *
 * @returns  The created header instance.
 */
UI.createHeader = function (params) {

    try {
        var header = Piwik.require('UI/Header');
        header.setParams(params);
        header.init();
        
        params = null;

        return header;
        
    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiCh33'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new menu instance.
 *
 * @see      Piwik.UI.Menu
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Menu.
 *
 * @type     Piwik.UI.Menu
 *
 * @returns  The created menu instance.
 */
UI.createMenu = function (params) {

    try {
        var menu = Piwik.require('UI/Menu');
        menu.setParams(params);
        menu.init();
        
        params   = null;

        return menu;

    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiCm35'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new refresh instance.
 *
 * @see      Piwik.UI.Refresh
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Refresh.
 *
 * @type     Piwik.UI.Refresh
 *
 * @returns  The created refresh instance.
 */
UI.createRefresh = function (params) {

    try {
        var instance = Piwik.require('UI/Refresh');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiCr38'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new visitor overview instance.
 *
 * @see      Piwik.UI.VisitorOverview
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.VisitorOverview.
 *
 * @type     Piwik.UI.VisitorOverview
 *
 * @returns  The created visitor overview instance.
 */
UI.createVisitorOverview = function (params) {

    try {
        var instance = Piwik.require('UI/VisitorOverview');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiVo41'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new visitor instance.
 *
 * @see      Piwik.UI.Visitor
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.Visitor.
 *
 * @type     Piwik.UI.Visitor
 *
 * @returns  The created visitor instance.
 */
 UI.createVisitor = function (params) {

    try {
        var instance = Piwik.require('UI/Visitor');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiCv43'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new live overview instance.
 *
 * @see      Piwik.UI.LiveOverview
 *
 * @param    {Object}  params  A dictionary object properties defined in Piwik.UI.LiveOverview.
 *
 * @type     Piwik.UI.LiveOverview
 *
 * @returns  The created live overview instance.
 */
UI.createLiveOverview = function (params) {

    try {
        var instance = Piwik.require('UI/LiveOverview');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError = UI.createError({exception: exception, errorCode: 'PiUiLo46'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new website list instance.
 *
 * @see      Piwik.UI.WebsiteList
 *
 * @param    {Object}  params  A dictionary object properties defined in  Piwik.UI.WebsiteList.
 *
 * @type     Piwik.UI.WebsiteList
 *
 * @returns  The created website list instance.
 */
UI.createWebsitesList = function (params) {

    try {
        var instance = Piwik.require('UI/WebsitesList');
        instance.setParams(params);
        instance.init();
        
        params = null;

        return instance;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiWl48'});
        uiError.showErrorMessageToUser();
    }
};

/**
 * Creates a new ImageView.
 *
 * @see      Piwik.UI.ImageView
 *
 * @param    {Object}  params  A dictionary object properties defined in  Piwik.UI.ImageView.
 *
 * @type     Titanium.UI.ImageView
 *
 * @returns  The created ImageView instance.
 */
UI.createImageView = function (params) {

    try {
        var instance = Piwik.require('UI/ImageView');
        var view     = instance.init(params);
        
        instance     = null;
        params       = null;
        
        return view;

    } catch (exception) {

        var uiError  = UI.createError({exception: exception, errorCode: 'PiUiIv62'});
        uiError.showErrorMessageToUser();
    }
    
    return Ti.UI.createImageView(params);
};

module.exports = UI;