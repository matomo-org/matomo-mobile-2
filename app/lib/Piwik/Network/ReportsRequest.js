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
 * @class     Fetches a list of all available reports for a given site using the metadata API.
 * 
 * @exports   ReportsRequest as Piwik.Network.ReportsRequest
 * @augments  Piwik.Network.Request
 */
function ReportsRequest () {

    /**
     * This event will be fired as soon as all available reports are fetched.
     *
     * @name   Piwik.Network.ReportsRequest#event:onload
     * @event
     *
     * @param  {Object}   event
     * @param  {string}   event.type              The name of the event.
     * @param  {Array}    event.site              See {@link Piwik.Network.ReportsRequest#site}.
     * @param  {boolean}  event.availableReports  See {@link Piwik.Network.ReportsRequest#availableReports}.
     */

    /**
     * An object containing the result of the Piwik 'API.getReportMetadata' method.
     *
     * @type  Object
     */
    this.availableReports = null;

    /**
     * The list of available reports that shall be requested for this site.
     *
     * @type  Object
     */
    this.site             = null;

    /**
     * The key used to cache the response. Once the response is cached we do not have to send the request again.
     *
     * @type  string
     */
    this.sessionKey       = null;
}

/**
 * Extend Piwik.Network.Request
 */
ReportsRequest.prototype  = Piwik.require('Network/Request');

/**
 * Initialize / reset all previous defined or fetched values. We have to do this cause it is possible to call the
 * 'send' method multiple times.
 */
ReportsRequest.prototype.init = function () {
    this.availableReports = null;
    this.site             = null;
    this.sessionKey       = null;
};

/**
 * Sends a request to the Piwik API using the method 'API.getReportMetadata' (see <a href="http://piwik.org/docs/analytics-api/metadata/#toc-listing-all-the-metadata-api-functions">Metadata API</a>)
 * to get a list of all available reports which the Server version does support. This list of available reports
 * depends on the Piwik Server version and on the installed plugins.
 * Executes the {@link Piwik.Network.ReportsRequest#loaded} method as soon as the result is received.
 *
 * @param  {object}   params
 * @param  {object}   params.site              The site object you want to receive a list of all available results.
 * @param  {boolean}  [params.reload="false"]  If true, it will not use an already cached result. 
 */
ReportsRequest.prototype.send = function (params) {
    this.init();

    this.site    = params.site;

    var settings = Piwik.require('App/Settings');
    var session  = Piwik.require('App/Session');
    
    var language = settings.getLanguage();

    // the report contains text/translations, therefore we have to add the language to the cache key.
    // the report contains a list of reports which are site specific, for example goals. Therefore we have to cache
    // the result by idSite and accountId.
    this.sessionKey      = 'piwik_report_metadata_' + this.site.accountId + '_' + this.site.idsite + '_' + language;
    var cachedReportData = session.get(this.sessionKey);
    
    settings = null;
    session  = null;
    
    if (!params.reload
        && cachedReportData
        && Piwik.isArray(cachedReportData)
        && 0 < cachedReportData.length) {
        // we already have a cached result

        this.availableReports = cachedReportData;
        cachedReportData      = null;

        // fire the result without sending a network request
        this.fire();
        
        params = null;
        
        return;
    }

    var accountManager = Piwik.require('App/Accounts');
    var account        = accountManager.getAccountById(this.site.accountId);
    var piwikRequest   = Piwik.require('Network/PiwikApiRequest');

    piwikRequest.setMethod('API.getReportMetadata');
    piwikRequest.setAccount(account);
    piwikRequest.setParameter({idSites: this.site.idsite, hideMetricsDoc: 1});
    piwikRequest.setCallback(this, this.loaded);
    piwikRequest.send();
    
    piwikRequest   = null;
    piwikRequest   = null;
    accountManager = null;
    account        = null;
    params         = null;
};

/**
 * Caches the reportMetaData and triggers the onload event.
 *
 * @param  {Object}  reportMetaData  See {@link Piwik.Network.ReportsRequest#send}
 */
ReportsRequest.prototype.loaded = function (reportMetaData) {

    if (!reportMetaData) {
        reportMetaData = [];
    }

    this.availableReports = reportMetaData;

    // do not cache an empty result
    if (reportMetaData && Piwik.isArray(reportMetaData) && 0 < reportMetaData.length) {
        var session = Piwik.require('App/Session');
        session.set(this.sessionKey, reportMetaData);
        session     = null;
    }
    
    reportMetaData = null;

    this.fire();
};

/**
 * Fires an 'onload' event containing the result of the ReportsRequest.
 *
 * @fires  Piwik.Network.ReportsRequest#event:onload
 */
ReportsRequest.prototype.fire = function () {

    var eventResult = {type: 'onload',
                       availableReports: this.availableReports,
                       site: this.site};

    this.fireEvent('onload', eventResult);
    eventResult     = null;
};

module.exports = ReportsRequest;