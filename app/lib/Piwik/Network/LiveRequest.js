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
 * @class     Fetches visitor information in real time via Live API.
 * 
 * @exports   LiveRequest as Piwik.Network.LiveRequest
 * @augments  Piwik.Network.Request
 */
function LiveRequest () {

    /**
     * This event will be fired as soon as all available live information are fetched.
     *
     * @name   Piwik.Network.LiveRequest#event:onload
     * @event
     *
     * @param  {Object}  event
     * @param  {string}  event.type         The name of the event.
     * @param  {Object}  event.site         See {@link Piwik.Network.LiveRequest#site}.
     * @param  {Object}  event.lastMinutes  See {@link Piwik.Network.LiveRequest#lastMinutes}.
     * @param  {Object}  event.lastHours    See {@link Piwik.Network.LiveRequest#lastHours}.
     * @param  {Array}   event.details      See {@link Piwik.Network.LiveRequest#details}.
     */

    /**
     * The site for that the live information shall be requested.
     *
     * @type  null|Object
     */
    this.site        = null;

    /**
     * An object than contain some information about the last 30 minutes as returned by the method "Live.getCounters".
     * For example number of actions and pageviews.
     *
     * @type  null|Object
     *
     * Object (
     *    [actions]         => [The total number of actions/pageviews]
     *    [visits]          => [The total number of visits]
     *    [visitsConverted] => [The total number of visits converted]
     * )
     *
     * @see   http://piwik.org/docs/analytics-api/reference/#Live
     * @see   http://demo.piwik.org/?module=API&method=Live.getCounters&idSite=7&lastMinutes=30&format=JSON&token_auth=anonymous
     */
    this.lastMinutes = null;

    /**
     * An object than contain some information about the last 24 hours as returned by the method "Live.getCounters".
     * For example number of actions and pageviews.
     *
     * @type  null|Object
     *
     * Object (
     *    [actions]         => [The total number of actions/pageviews]
     *    [visits]          => [The total number of visits]
     *    [visitsConverted] => [The total number of visits converted]
     * )
     *
     * @see   http://piwik.org/docs/analytics-api/reference/#Live
     * @see   http://demo.piwik.org/?module=API&method=Live.getCounters&idSite=7&lastMinutes=30&format=JSON&token_auth=anonymous
     */
    this.lastHours   = null;

    /**
     * An array that holds a list of each visitor as returned by the Piwik API "Live.getLastVisitsDetails". These
     * are the latest visitors.
     *
     * @type  Array
     *
     * Array (
     *    [int] => [Object that contains detailed information about each visitor]
     * )
     */
    this.details     = null;
}

/**
 * Extend Piwik.Network.Request
 */
LiveRequest.prototype = Piwik.require('Network/Request');

/**
 * Initialize / reset all previous defined or fetched values. We have to do this cause it is possible to call the
 * 'send' method multiple times.
 */
LiveRequest.prototype.init = function () {
    this.site        = null;
    this.lastHours   = null;
    this.lastMinutes = null;
    this.details     = null;
};

/**
 * Sends multiple requests to the Piwik API methods 'Live.getCounters' and 'Live.getLastVisitsDetails' to fetch
 * minimal information about the last minutes / last hours as well as detailed information about the last visits.
 * By default the methods fetches only the last 10 visitors cause lots of data will be fetched. This makes sure
 * the user gets a result "very fast". If a minTimestamp or paging is given, it will request more visitors. This
 * takes a bit longer but in such a case there are already some visitors displayed.
 *
 * @param  {Object}  params
 * @param  {Object}  params.site                 The site object for that you want to receive the live information.
 * @param  {number}  [params.minTimestamp]       If the timestamp is given, it fetches only visitors which visited
 *                                               the site after this timestamp. Use this to fetch only new visitors
 *                                               since a specific time.
 * @param  {number}  [params.maxIdVisit]         If a visitorId is given, it fetches only visitors which visited
 *                                               the site before this visitor.
 * @param  {number}  [params.fetchLiveOverview]  If true, an overview about the visitors will be fetched.
 * @param  {string}  [params.date]               The current selected date.
 *
 * @todo   add a link to the methods
 */
LiveRequest.prototype.send = function (params) {
    this.init();

    this.site = params.site;

    if (!this.site) {
        // site is not given, fire loaded event directly. Event contains an empty result in such a case. The
        // callback method should be able to handle such a case.
        this.loaded();
        
        return;
    }

    var accountManager = Piwik.require('App/Accounts');
    var account        = accountManager.getAccountById(this.site.accountId);
    accountManager     = null;

    var requestPool    = Piwik.require('Network/RequestPool');
    requestPool.setContext(this);

    if (params.fetchLiveOverview) {
        // normally, we would create a LiveOVerviewRequest for these two requests.
        // But by doing these requests here, an error message will be thrown only once if there occurs any error.
        // So we don't display a possible error for Live.getCounters and for Live.getLastVisitsDetails.
        var piwikLiveMinutes = Piwik.require('Network/PiwikApiRequest');
        piwikLiveMinutes.setMethod('Live.getCounters');
        piwikLiveMinutes.setAccount(account);
        piwikLiveMinutes.setParameter({idSite: this.site.idsite, lastMinutes: 30});
        piwikLiveMinutes.setCallback(this, this.onReceiveLiveMinutes);

        var piwikLiveHours   = Piwik.require('Network/PiwikApiRequest');
        piwikLiveHours.setMethod('Live.getCounters');
        piwikLiveHours.setAccount(account);
        piwikLiveHours.setParameter({idSite: this.site.idsite, lastMinutes: 1440});
        piwikLiveHours.setCallback(this, this.onReceiveLiveHours);

        requestPool.attach(piwikLiveHours);
        requestPool.attach(piwikLiveMinutes);
        piwikLiveHours   = null;
        piwikLiveMinutes = null;
    }

    var parameters = {idSite: this.site.idsite};

    if (params.minTimestamp) {
        parameters.minTimestamp = params.minTimestamp;
        // we can not query all... especially on high traffic pages... 
        parameters.filter_limit = config.piwik.filterLimit;
    } else if (params.maxIdVisit) {
        parameters.maxIdVisit   = params.maxIdVisit;
        parameters.filter_limit = config.piwik.filterLimit;
    } else {
        // if timestamp is not given, request only 10
        parameters.filter_limit = 10;
    }
    
    if (params.date) {
        parameters.date     = '' + params.date;
        var positionComma   = parameters.date.indexOf(',');
        
        // API does not support date range format 'YYYY-MM-DD,YYYY-MM-DD'.
        if (-1 !== parameters.date.indexOf(',')) {
            parameters.date = parameters.date.substr(0, positionComma);
        }
    }

    var piwikLiveDetails = Piwik.require('Network/PiwikApiRequest');
    piwikLiveDetails.setMethod('Live.getLastVisitsDetails');
    piwikLiveDetails.setAccount(account);
    piwikLiveDetails.setParameter(parameters);
    piwikLiveDetails.setCallback(this, this.onReceiveLiveDetails);

    requestPool.attach(piwikLiveDetails);
    requestPool.send(this.loaded);
    
    piwikLiveDetails = null;
    requestPool      = null;
    account          = null;
    params           = null;
    parameters       = null;
};

/**
 * Callback method which will be called as soon as the data of the last minutes live counters are fetched. Stores
 * the given response (only the object) in the {@link Piwik.Network.LiveRequest#lastMinutes} property.
 *
 * @param  {Array}  response  The given response is an array that contains only one object.
 *                            See {@link Piwik.Network.LiveRequest#lastMinutes}
 */
LiveRequest.prototype.onReceiveLiveMinutes = function (response) {
    if (!response || !Piwik.isArray(response) || !response.length) {
        Piwik.getLog().warn('Response is not valid', 'Piwik.Network.LiveRequest::onReceiveLiveMinutes');

        return;
    }

    if (!response[0] || 'undefined' == (typeof response[0].actions)) {
        Piwik.getLog().warn('No values given', 'Piwik.Network.LiveRequest::onReceiveLiveMinutes');

        return;
    }

    this.lastMinutes = response[0];
    response         = null;
};

/**
 * Callback method which will be called as soon as the data of the last hours live counters are fetched. Stores
 * the given response (only the object) in the {@link Piwik.Network.LiveRequest#lastHours} property.
 *
 * @param  {Array}  response  The given response is an array that contains only one object.
 *                            See {@link Piwik.Network.LiveRequest#lastHours}
 */
LiveRequest.prototype.onReceiveLiveHours = function (response) {
    if (!response || !Piwik.isArray(response) || !response.length) {
        Piwik.getLog().warn('Response is not valid', 'Piwik.Network.LiveRequest::onReceiveLiveHours');

        return;
    }

    if (!response[0] || 'undefined' == (typeof response[0].actions)) {
        Piwik.getLog().warn('No values given', 'Piwik.Network.LiveRequest::onReceiveLiveHours');

        return;
    }

    this.lastHours = response[0];
    response       = null;
};

/**
 * Callback method which will be called as soon as the data of the 'Live.getLastVisitsDetails' are fetched. Stores
 * the given array (a list of visitors) in the {@link Piwik.Network.LiveRequest#details} property.
 *
 * @param  {Array}  response  The given response is an array that contains an object for each visitor.
 *                            See {@link Piwik.Network.LiveRequest#details}.
 */
LiveRequest.prototype.onReceiveLiveDetails = function (response) {
    if (!response || !Piwik.isArray(response)) {
        Piwik.getLog().warn('Response is not valid', 'Piwik.Network.LiveRequest::onReceiveLiveDetails');

        return;
    }

    this.details = response;
    response     = null;
};

/**
 * Triggers the onload event.
 * 
 * @fires  Piwik.Network.LiveRequest#event:onload
 */
LiveRequest.prototype.loaded = function () {

    var eventResult = {type: 'onload',
                       site: this.site,
                       lastMinutes: this.lastMinutes,
                       details: this.details,
                       lastHours: this.lastHours};

    this.fireEvent('onload', eventResult);
    
    eventResult = null;
};

module.exports = LiveRequest;