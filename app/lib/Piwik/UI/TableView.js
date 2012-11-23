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
 * @class    A TableView is created by the method Piwik.UI.createTableView. It extends the default Titanium TableView
 *           by some useful methods like 'reset' and 'cleanup'. It also automatically sets theme related settings
 *           and handles platform specific differences. Always use this UI widget in order to create a TableView. This 
 *           ensures the same look and feel without the need of handling platform differences.
 *
 * @param    {Object}  [params]  See <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.TableView-object.html">Titanium API</a> for a list of all available parameters.
 *
 * @example
 * var tableview = Piwik.getUI().createTableView({id: 'myTableView'}); // creates an instance of the tableview.
 * 
 * @exports  TableView as Piwik.UI.TableView
 */
function TableView () {
    
    /**
     * Holds the Titanium TableView instance once the UI widget is initialized.
     *
     * @type  Ti.UI.TableView|null
     */
    this.tableView = null;

    /**
     * Holds an array of all currently set TableViewRows and TableViewSections.
     *
     * ARRAY ( [int] => [Ti.UI.TableViewRow|Ti.UI.TableViewSection] )
     *
     * @type  Array|null
     */
    this.data      = null;
}

/**
 * Extend Piwik.UI.View
 */
TableView.prototype = Piwik.require('UI/View');

/**
 * Initializes the TableView.
 */
TableView.prototype.init = function () {

    this.tableView = Ti.UI.createTableView(this.getParams());
};

/**
 * Add an event listener to receive triggered events. The callback will be executed in the
 * {@link Ti.UI.TableView} context.
 *
 * @param  {string}    name      Name of the event you want to listen to.
 * @param  {Function}  callback  Callback function to invoke when the event is fired
 */
TableView.prototype.addEventListener = function (name, callback) {
    
    if (!this.tableView) {
        callback = null;
        
        return;
    }
    
    this.tableView.addEventListener(name, callback);
    
    callback = null;
};

/**
 * Fires an event to all listeners. The event will be fired in {@link Ti.UI.TableView} context.
 *
 * @param  {string}    name   Name of the event you want to fire.
 * @param  {Function}  event  An event object that will be passed to the callback function which was added
 *                            via addEventListener.
 */
TableView.prototype.fireEvent = function (name, event) {
        
    if (!this.tableView) {
        event = null;
        
        return;
    }
    
    this.tableView.fireEvent(name, event);
    
    event = null;
};

/**
 * I recomment to call the {@link Piwik.UI.TableView#reset} method before setting new data to free the memory of 
 * the previous set rows.
 */
TableView.prototype.setData = function (data) {

    this.data = data;
    data      = null;
            
    if (!this.tableView) {
        
        return;
    }
    
    this.tableView.setData(this.data);
};

/**
 * Sets the value of the footerView property.
 * 
 * @param  {Ti.UI.View}  footerView
 */
TableView.prototype.setFooterView = function (footerView) {
    
    if (!this.tableView) {
        footerView = null;
        
        return;
    }
    
    this.tableView.setFooterView(footerView);
    
    footerView = null;
};

/**
 * Performs a batch update of all supplied layout properties and schedules a layout pass after they have been updated.
 * 
 * @param  {Pbject}  properties
 */
TableView.prototype.updateLayout = function (properties) {
        
    if (!this.tableView) {
        properties = null;
        
        return;
    }
    
    this.tableView.updateLayout(properties);
    
    properties = null;
};

/**
 * Sets this tableview's content insets.
 * 
 * @param  {number}  contentInsets
 */
TableView.prototype.setContentInsets = function (contentInsets) {
        
    if (!this.tableView) {
        setContentInsets = null;
        
        return;
    }
    
    this.tableView.setContentInsets(contentInsets);
    
    setContentInsets = null;
};

/**
 * View positioned above the first row that is only revealed when the user drags the table contents down.
 * 
 * @param  {Ti.UI.View}  headerPullView
 */
TableView.prototype.setHeaderPullView = function (headerPullView) {
        
    if (!this.tableView) {
        headerPullView = null;
        
        return;
    }
    
    this.tableView.setHeaderPullView(headerPullView);
    
    headerPullView = null;
};

/**
 * Scrolls the table to a specific top position where 0 is the topmost y position in the table view.
 */
TableView.prototype.scrollToTop = function () {
    if (!this.tableView || !this.tableView.scrollToTop) {
        
        return;
    }
    
    this.tableView.scrollToTop();
};

/**
 * Receive the Titanium TableView instance for example to add the UI widget to a window.
 * 
 * @type Ti.UI.TableView
 */
TableView.prototype.get = function () {
    return this.tableView;
};

/**
 * Resets the tableview. Removes all added rows and sections from the tableview and cleans them up to free memory.
 * The tableview will be blank afterwards.
 */
TableView.prototype.reset = function () {

    this.resetRows();

    if (!this.tableView) {
        
        return;
    }

    this.tableView.setData([]);
};

/**
 * Resets the tableview's rows. Removes all added rows and sections from the tableview and cleans them up to free 
 * memory.
 */
TableView.prototype.resetRows = function () {

    if (this.data) {
        for (var index = 0; index < this.data.length; index++) {
           
            if (this.data[index] && this.data[index].cleanup) {
                this.data[index].cleanup();
            }
            
            this.data[index] = null;
        }
    }
    
    this.data = null;
    this.data = [];
};

/**
 * Resets the tableview as well as cleans up the tableview itself.
 */
TableView.prototype.cleanup = function () {
    this.resetRows();
    
    if (this.tableView && this.tableView.headerPullView) {
        this.tableView.headerPullView = null;
    }
    
    if (this.tableView && this.tableView.footerView) {
        this.tableView.footerView = null;
    }
    
    this.tableView = null;
    this.params    = null;
};

module.exports = TableView;