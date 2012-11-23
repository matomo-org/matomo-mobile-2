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
var config = require('config');

/**
 * @type  Piwik.Network.RequestPool|null
 * 
 * @private
 */
var requestPool = null;

/**
 * @class     Fetches a list of all available websites where the user has at least view access. Requests all available
 *            websites for all configured accounts.
 * 
 * @exports   WebsitesRequest as Piwik.Network.WebsitesRequest
 * @augments  Piwik.Network.Request
 */
function WebsitesRequest () {

    /**
     * This event will be fired as soon as all requests are finished.
     *
     * @name   Piwik.Network.WebsitesRequest#event:onload
     * @event
     *
     * @param  {Object}   event
     * @param  {string}   event.type                The name of the event.
     * @param  {Array}    event.sites               See {@link Piwik.Network.WebsitesRequest#sites}.
     * @param  {boolean}  event.showMultiChart      See {@link Piwik.Network.WebsitesRequest#showMultiChart}.
     * @param  {boolean}  event.filterUsed          See {@link Piwik.Network.WebsitesRequest#filterUsed}.
     * @param  {boolean}  event.achievedSitesLimit  See {@link Piwik.Network.WebsitesRequest#achievedSitesLimit}.
     */
    
    /**
     * Holds an array of all available websites where the user has at least view access.
     *
     * @type  Array
     */
    this.sites          = [];
    
    /**
     * True if multichart is enabled, false otherwise. Multicharts are the sparklines displayed beside the website name.
     *
     * @defaults  false
     *
     * @type      boolean
     */
    this.showMultiChart = false;
    
    /**
     * An array of all available accounts.
     *
     * @see   Piwik.App.Accounts#getAccounts
     *
     * @type  Array
     */
    this.accounts       = [];
    
    /**
     * True if search function was used, false otherwise.
     *
     * @defaults  false
     *
     * @type      boolean
     */
    this.filterUsed     = false;
    
    /**
     * True if the number of requestes sites (limit parameter) is achieved. False otherwise.
     *
     * @defaults  false
     *
     * @type      boolean
     */
    this.achievedSitesLimit = false;
}

/**
 * Extend Piwik.Network.Request
 */
WebsitesRequest.prototype = Piwik.require('Network/Request');

/**
 * Initialize / reset all previous defined or fetched values. We have to do this cause it is possible to call the
 * 'send' method multiple times.
 */
WebsitesRequest.prototype.init = function () {
    this.sites              = [];
    this.filterUsed         = false;
    this.accounts           = null;
    this.achievedSitesLimit = false;

    var settings        = Piwik.require('App/Settings');
    this.showMultiChart = settings.getPiwikMultiChart();
    settings            = null;

    var accountManager  = Piwik.require('App/Accounts');
    this.accounts       = accountManager.getAccounts();
    accountManager      = null;
};

/**
 * Sends a request for each configured account to determine all websites the user has at least view access. Executes
 * the {@link Piwik.Network.WebsitesRequest#loaded} method as soon as all responses are received. Executes the
 * {@link Piwik.Network.WebsitesRequest#onReceiveSitesWithAtLeastViewAccess} for each received request result (for
 * each account). Requests by default only 5 sites per account (if filterName is not given).
 *
 * @param  {Object}   params
 * @param  {Object}   params.filterName        Search only for sites which contains the given filterName.
 * @param  {boolean}  [params.reload="false"]  If true, it will not use an already cached result.
 */
WebsitesRequest.prototype.send = function (params) {
    this.init();

    if (!params) {
        params = {};
    }

    if (!params.reload) {
        params.reload = false;
    }

    var piwikRequest  = null;
    requestPool       = Piwik.require('Network/RequestPool');
    requestPool.setContext(this);

    if (!this.accounts || !this.accounts.length) {
        // no accounts configured
        this.loaded();

        return;
    }

    if (!params.reload && (!params || !params.filterName)) {
        // no filter used, use cached result if it exist
        var session     = Piwik.require('App/Session');
        var cachedSites = session.get('piwik_sites_allowed');
        session         = null;
        
        if (cachedSites) {
            this.filterUsed = false;
            this.sites      = cachedSites;
            cachedSites     = null;

            this.loaded();

            return;
        }
    }

    var parameter = null;
    
    for (var index = 0; index < this.accounts.length; index++) {
    
        if (!this.accounts[index] || !Boolean(this.accounts[index].active)) {
            // account is not set or not active
            continue;
        }

        // create a request to fetch all sites the user has at least view access
        piwikRequest = Piwik.require('Network/PiwikApiRequest');
        parameter    = {accountId: this.accounts[index].id, limit: config.piwik.numDisplayedWebsites};
        
        if (params && params.filterName) {
            parameter.pattern = params.filterName;
            piwikRequest.setMethod('SitesManager.getPatternMatchSites');
            this.filterUsed   = true;

        } else {
            piwikRequest.setMethod('SitesManager.getSitesWithAtLeastViewAccess');
            this.filterUsed   = false;
        }

        piwikRequest.setParameter(parameter);
        piwikRequest.setAccount(this.accounts[index]);
        piwikRequest.setCallback(this, this.onReceiveSitesWithAtLeastViewAccess);

        // attach the request to the request pool. So all attached requests will be send in parallel
        requestPool.attach(piwikRequest);
        
        Piwik.require('App/Accounts').updatePiwikVersion(this.accounts[index]);
        
        piwikRequest = null;
    }

    requestPool.send(this.loaded);
    
    requestPool = null;
    params      = null;
    parameter   = null;
};

/**
 * Abort all previous fired requests. No callback method will be called.
 */
WebsitesRequest.prototype.abort = function () {
    if (requestPool && requestPool.abort) {
        requestPool.abort();
    }
};

/**
 * Will be called for each "SitesManager.getSitesWithAtLeastViewAccess" response. See <a href="http://piwik.org/docs/analytics-api/reference/#SitesManager">SitesManager</a> for more
 * information. Adds each allowed website to the {@link Piwik.Network.WebsitesRequest#sites} Array.
 *
 * @param  {Array}   response   The received response of the request.
 * @param  {Object}  parameter  The used parameters to send the request.
 */
WebsitesRequest.prototype.onReceiveSitesWithAtLeastViewAccess = function (response, parameter) {

    var allowedSites = response;

    if (!allowedSites || !Piwik.isArray(allowedSites) || 0 == allowedSites.length) {
        // the user has no access to any website

        return;
    }

    // try to find the account that was used to send the request, depending on the accountId.
    var account = {};
    for (var index = 0; index < this.accounts.length; index++) {
        if (this.accounts[index] && this.accounts[index].id == parameter.accountId) {
            // this account was used to send the request
            account = this.accounts[index];

            break;
        }
    }

    var numFoundSitesPerAccount = 0;
    for (var sitesIndex = 0; sitesIndex < allowedSites.length; sitesIndex++) {

        var site = allowedSites[sitesIndex];

        if (!site) {
            continue;
        }

        site.sparklineUrl     = '';
        if (this.showMultiChart) {
            var graph         = Piwik.require('PiwikGraph');
            
            site.sparklineUrl = graph.getSparklineUrl(site.idsite, account.accessUrl, account.tokenAuth);
            graph             = null;
        }

        site.accountId        = parameter.accountId;
        numFoundSitesPerAccount++;

        this.sites.push(site);
        site = null;
    }

    if (numFoundSitesPerAccount && config.piwik.numDisplayedWebsites <= numFoundSitesPerAccount) {
        this.achievedSitesLimit = true;
    }
    
    allowedSites = null;
    response     = null;
    account      = null;
    
    return;
};

/**
 * Will be called as soon as all requests have received and processed their result/callbacks. We can now fire an
 * event containing all sites the user has at least view access and other additional information.
 *
 * @fires  Piwik.Network.WebsitesRequest#event:onload
 */
WebsitesRequest.prototype.loaded = function () {

    if (!this.filterUsed) {
        // cache only if no filter was used
        var session = Piwik.require('App/Session');
        session.set('piwik_sites_allowed', this.sites);
        session     = null;
    }

    var eventResult = {type: 'onload',
                       sites: this.sites,
                       filterUsed: this.filterUsed,
                       achievedSitesLimit: this.achievedSitesLimit,
                       showMultiChart: this.showMultiChart};

    this.fireEvent('onload', eventResult);
    
    eventResult     = null;
};

module.exports = WebsitesRequest;