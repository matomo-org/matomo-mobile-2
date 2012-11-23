/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik  = require('library/Piwik');
/** @private */
var _      = require('library/underscore');

/**
 * @class     A websites list is created by the method Piwik.UI.createWebsiteList. It displays a list of all available
 *            websites. The user has also the possibility to search for a website.
 *
 * @exports   WebsitesList as Piwik.UI.WebsitesList
 * @augments  Piwik.UI.View
 */
function WebsitesList () {

    /**
     * This event will be fired as soon as the user chooses a website within the websites list.
     *
     * @name   Piwik.UI.WebsitesList#event:onChooseSite
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     * @param  {Array}   event.site  The chosen website.
     */

    /**
     * This event will be fired if the user has access to only one website and only if this event was enabled via
     * the parameter 'handleOnlyOneSiteAvailableEvent'.
     *
     * @name   Piwik.UI.WebsitesList#event:onOnlyOneSiteAvailable
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type  The name of the event.
     * @param  {Array}   event.site  The chosen website.
     */

    this.websitesRequest = Piwik.require('Network/WebsitesRequest');
}

/**
 * Extend Piwik.UI.View
 */
WebsitesList.prototype = Piwik.require('UI/View');

/**
 * Initialize website list
 *
 * @fires  Piwik.UI.WebsitesList#event:onChooseSite
 * @fires  Piwik.UI.WebsitesList#event:onOnlyOneSiteAvailable
 */
WebsitesList.prototype.init = function () {

    var that      = this;
    var win       = this.getParam('view');

    // we always want to force the reload (do not use a cached result) of the available websites if user presses
    // menu button 'reload', but not if for example the user searches for a site.
    var forceRequestReload = true;
    // true as soon as at least once the onload event was fired, false otherwise. we need this for a workaround with
    // the hide/show searchbar logic.
    var onLoadEventFired   = false;
    
    var refresh   = null;
    var rows      = [];

    var searchBar = Ti.UI.createSearchBar({id: 'websiteSearchBar', 
                                           hintText: _('Mobile_SearchWebsite')});

    searchBar.addEventListener('return', function (event) {

        if (!event) {

            return;
        }

        that.websitesRequest.abort();

        forceRequestReload = false;
        
        if (refresh) {
            refresh.refresh();
        }

        searchBar.blur();
    });

    searchBar.addEventListener('cancel', function () {

        searchBar.value = '';
        searchBar.blur();

        forceRequestReload = false;
        
        if (refresh) {
            refresh.refresh();
        }
    });
    
    if (Piwik.getPlatform().isAndroid) {
        // this should prevent that keyboard is displayed after app is started on android. 
        // @todo verify whether we still need this workaround
        searchBar.hide();
        
        // this workaround is for motorola xoom and possibly some other devices. once this window is not displayed
        // we have to hide the searchbar. otherwise the keyboard will be opened each time the user closes another window
        // have no idea why.
        win.addEventListener('blurWindow', function () {
            searchBar.hide();
            searchBar.blur();
            // makes sure the next time the window is focused, it'll show the searchbar
            onLoadEventFired = true;
        });

        win.addEventListener('focusWindow', function () {
            if (onLoadEventFired) {
                searchBar.show();
            }
        });
    }
    
    win.add(searchBar);

    var tableview = this.create('TableView', {id: 'websitesTableView', top: searchBar.height});

    tableview.addEventListener('click', function (event) {
        if (!event || !event.row || !event.row.site) {

            return;
        }
        
        var session = Piwik.require('App/Session');
        session.set('current_site', event.row.site);

        that.fireEvent('onChooseSite', {site: event.row.site, name: 'onChooseSite'});
        
        event = null;
    });

    win.add(tableview.get());

    refresh = this.create('Refresh', {tableView: tableview});

    refresh.addEventListener('onRefresh', function () {
 
        // remove all tableview rows. This makes sure there are no rendering issues when setting
        // new rows afterwards.
        if (tableview) {
            tableview.reset();
        }

        var params = {reload: forceRequestReload};
        if (searchBar && searchBar.value) {
            params.filterName = searchBar.value;
        }
        
        if (that && that.websitesRequest) {
            that.websitesRequest.send(params);
        }

        forceRequestReload = true;
    });

    this.websitesRequest.addEventListener('onload', function (event) {
        
        onLoadEventFired = true;

        if (refresh) {
            refresh.refreshDone();
        }

        if (!event || !event.sites || !event.sites.length) {
              
            // not 100% working workaround for:
            // https://jira.appcelerator.org/browse/TIMOB-7609 
            // Android: Searchbar gets the focus when inside the tableview showing keyboard by default
            if (Piwik.getPlatform().isAndroid) {
                setTimeout(function () { searchBar.show(); }, 800);
            } 
            
            rows = [that.create('TableViewRow', {title: _('Mobile_NoWebsiteFound'),
                                                 className: 'websitesNotFoundTableViewRow'})];
            tableview.setData(rows);
            rows = null;
      
            return;
        }
        
        if (that.getParam('handleOnlyOneSiteAvailableEvent', false) &&
            !event.filterUsed && 1 == event.sites.length && event.sites[0]) {
            // fire only if this event is enabled.
            // do not fire this event if user has used the filter/searchBar. Maybe that is not the site
            // he was looking for.
            
            // do not show searchBar in this case, otherwise the keyboard may be opened each time the user 
            // closes another window. See workarounds above and below

            var session = Piwik.require('App/Session');
            session.set('current_site', event.sites[0]);

            that.fireEvent('onOnlyOneSiteAvailable', {site: event.sites[0], type: 'onOnlyOneSiteAvailable'});
            return;
        }
  
        // not 100% working workaround for:
        // https://jira.appcelerator.org/browse/TIMOB-7609 
        // Android: Searchbar gets the focus when inside the tableview showing keyboard by default
        if (Piwik.getPlatform().isAndroid) {
            setTimeout(function () { searchBar.show(); }, 350);
        } 

        rows = [];
        
        event.sites.sort(function (site1, site2) {
            
            if (!site1 && !site2) {
                
                return 0;
            }
                
            
            if (!site1) {
                
                return -1;
            }
            
            if (!site2) {
                
                return 1;
            }
            
            var siteName1 = ('' + site1.name).toLowerCase();
            var siteName2 = ('' + site2.name).toLowerCase();
            
            if (siteName1 == siteName2) {
        
                return 0;
            }
        
            return (siteName1 < siteName2) ? -1 : 1;
        });

        for (var siteIndex = 0; siteIndex < event.sites.length; siteIndex++) {
            var site = event.sites[siteIndex];

            if (!site) {
                continue;
            }

            rows.push(that.create('TableViewRow', {title: '' + site.name,
                                                   id: site.idsite,
                                                   name: 'site' + site.idsite,
                                                   site: site,
                                                   rightImage: {url: site.sparklineUrl, width: 100, height: 25},
                                                   className: 'websiteTableViewRow'}));
            site = null;
        }
        
        if (event && event.achievedSitesLimit) {

            var config            = require('config');
            var searchHintRow     = Ti.UI.createTableViewRow({className: 'searchHintTableViewRow'});
            var searchBarHintText = String.format(_('Mobile_UseSearchBarHint'), 
                                                  '' + config.piwik.numDisplayedWebsites);
            
            searchHintRow.add(Ti.UI.createLabel({text: searchBarHintText, className: 'searchHintLabel'}));
            rows.push(searchHintRow);
            
            searchHintRow = null;
            config        = null;
        }
        
        tableview.setData(rows);
        rows = null;
    });
    
    win   = null;
    event = null;
};

/**
 * Request the list of all available websites. Sends an async request to the piwik api.
 * 
 * @param  {Object}  [params]  See {@link Piwik.Network.WebsitesRequest#send}
 */
WebsitesList.prototype.request = function (params) {
    
    if (!params) {
        params = {};
    }
    
    this.websitesRequest.send(params);
};

module.exports = WebsitesList;