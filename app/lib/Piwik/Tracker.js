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
/** @private */
var queue  = Piwik.require('Tracker/Queue');
 
/**
 * @class    Piwik Tracker tracks page views, events and so on to a configured Piwik Server installation. Tracking
 *           can be configured in config.js. Sends the requests async. The tracking is anonymous and will only be
 *           executed if user has enabled tracking and if tracking is enabled in configuration. Make sure no user
 *           data will be sent to the Piwik Server installation. For example the name of a website (via DocumentTitle)
 *           and so on.
 *
 * @exports  Tracker as Piwik.Tracker
 * @static
 */
function Tracker () {

    /**
     * The siteId of the Piwik Server installation. It'll track everything into this site.
     *
     * @type  number
     */
    this.siteId         = config.tracking.siteId;

    /**
     * The api version of the Piwik Server installation.
     *
     * @type  number
     */
    this.apiVersion     = config.tracking.apiVersion;

    /**
     * Holds the current document title. This document title will be used in all trackings until another document
     * title is set.
     * 
     * @see       Piwik.Tracker#setDocumentTitle
     *
     * @defaults  ""
     *
     * @type      string
     * 
     * @private
     */
    var documentTitle   = '';

    /**
     * Holds the current url. This url will be used in all trackings until another current url is set.
     *
     * @see       Piwik.Tracker#setCurrentUrl
     *
     * @defaults  ""
     *
     * @type      string
     * 
     * @private
     */
    var currentUrl      = '';

    /**
     * Holds the number of how often the user has already started the app (visits). We store this value in application
     * storage and increase it by one on each app start.
     *
     * @see       Piwik.Tracker#_getVisitCount
     *
     * @defaults  0
     *
     * @type      number
     * 
     * @private
     */
    var visitCount      = 0;

    /**
     * Holds the visitor uuid. The uuid is an anonymous / pseudo unique ID to fingerprint an user. We create an
     * uuid for each user on app start and store this uuid in application store afterwards. This makes sure we always
     * use the same uuid for an user.
     *
     * @see   Piwik.Tracker#_getUniqueId
     *
     * @type  null|string
     * 
     * @private
     */
    var uuid            = null;

    /**
     * This is the baseUrl which will be prepended to absolute/relative paths. If you set - for example - the current
     * Url to '/x/y' it will prepend this url. This makes sure we have a uri including protocol and so on.
     *
     * @type  string
     * 
     * @private
     */
    var baseUrl         = config.tracking.baseUrl;

    /**
     * These parameters holds all tracking information and will be send to the Piwik Server installation. Will be reset
     * after each tracking.
     *
     * @type  Object
     * 
     * @private
     */
    var parameter       = {};

    /**
     * Initializes the tracker.
     */
    this.init = function () {

        visitCount = this._getVisitCount();
        uuid       = this._getUniqueId();
        
        this.prepareVisitCustomVariables();
    };

    /**
     * Get the unique visitor id. If no visitor id exists, it'll arrange the generation of an uuid.
     *
     * @type  string
     *
     * @private
     */
    this._getUniqueId = function () {

        if (uuid) {

            return uuid;
        }

        // have a look whether there is an already created uuid
        var storage    = Piwik.require('App/Storage');
        var cachedUUid = storage.get('tracking_visitor_uuid');

        if (cachedUUid && storage.KEY_NOT_FOUND !== cachedUUid) {

            uuid  = cachedUUid;

            return uuid;
        }

        return this._generateUniqueId();
    };

    /**
     * Generates an unique visitor id for this user. The generated unique id will be different each time you call it.
     * Once a visitor id is generated, it will be stored in application store for later usage via
     * {@link Piwik.Tracker#_getUniqueId}
     *
     * @type  string
     *
     * @private
     */
    this._generateUniqueId = function () {

        var now   = new Date();
        var nowTs = Math.round(now.getTime() / 1000);

        // generate uuid for this visitor
        uuid      = '';
        uuid      = Ti.Platform.osname + Ti.Platform.id + nowTs + Ti.Platform.model;
        uuid      = Ti.Utils.md5HexDigest(uuid).slice(0, 16);

        var storage = Piwik.require('App/Storage');
        storage.set('tracking_visitor_uuid', uuid);
        storage     = null;

        return uuid;
    };

    /**
     * Increase the count by one and return the current visit count. Make sure this method will be only called once
     * per app start.
     *
     * @type  number
     *
     * @private
     */
    this._getVisitCount = function () {

        if (visitCount) {

            return visitCount;
        }

        // have a look whether there is already a visit count number
        var storage          = Piwik.require('App/Storage');
        var cachedVisitCount = storage.get('tracking_visit_count');

        if (cachedVisitCount && storage.KEY_NOT_FOUND !== cachedVisitCount) {

            visitCount = cachedVisitCount;

            visitCount++;
        }

        // first visit
        if (!visitCount) {

            visitCount = 1;
        }

        storage.set('tracking_visit_count', visitCount);
        
        storage = null;

        return visitCount;
    };
    
    /**
     * Tracks a window. It'll always detect the controller / action depending on the given url. Call this method if 
     * a window gets focus. For more information see {@link Piwik.Tracker#trackPageView}.
     * 
     * @param  {string}  windowUrl  A window url, for example "site/index". In this case, "site" is the controller
     *                              and "index" is the action. It'll track the Title "site index" and the url
     *                              "/window/site/index".
     */
    this.trackWindow = function (windowUrl) {
        
        if (!windowUrl) {
            
            return;
        }
        
        var urlParams  = ('' + windowUrl).split('/');
        var controller = urlParams[0];
        var action     = ('' + urlParams[1]).split('.js')[0];
        var title      = controller + ' ' + action;
        var url        = '/window/' + controller + '/' + action;
        
        this.setDocumentTitle(title).setCurrentUrl(url).trackPageView();
    };

    /**
     * Log a page view. A page view is for example a new opened window or navigating to an already opened window.
     * Make sure you've set a document title {@link Piwik.Tracker#setDocumentTitle} and current url
     * {@link Piwik.Tracker#setCurrentUrl} before.
     */
    this.trackPageView = function () {

        parameter.action_name = '' + documentTitle;
        parameter.url         = currentUrl;

        this._dispatch();
    };

    /**
     * Logs an event. An event is for example a click or a setting change.
     *
     * @param  {Object}  event
     * @param  {string}  event.title  The title of the event.
     * @param  {string}  event.url    An absolute url to identify this event without protocol and so on.
     */
    this.trackEvent = function (event) {
        
        parameter.action_name = '' + event.title;
        parameter.url         = baseUrl + '/event' + event.url;
        event                 = null;

        this._dispatch();
    };

    /**
     * Track a specific goal. Make sure you've set a document title before. Uses the last set url automatically.
     * 
     * @param  {number}  goalId
     */
    this.trackGoal = function (goalId) {

        parameter.idgoal = '' + goalId;
        parameter.url    = currentUrl;

        this._dispatch();
    };

    /**
     * Logs an exception.
     *
     * @param  {Object}  exception
     * @param  {string}  exception.file       The name of the file where the exception was thrown.
     * @param  {string}  exception.line       The number of the line where the exception was thrown.
     * @param  {string}  exception.message    The exception message.
     * @param  {string}  exception.type       The name of the exception, for example TypeError.
     * @param  {string}  exception.errorCode  An absolute url to identify this event without protocol and so on.
     */
    this.trackException = function (exception) {

        if (!exception) {
            
            return;
        }

        exception.file    = '' + exception.file;
        exception.message = '' + exception.message;

        if (exception && exception.file && 60 < exception.file.length) {
            // use max 60 chars
            exception.file    = exception.file.substr(exception.file.length - 60);
        }

        if (exception && exception.message && 200 < exception.message.length) {
            // use max 200 chars
            exception.message = exception.message.substr(0, 200);
        }

        var url   = '/exception/' + exception.type;
        url      += '/' + exception.errorCode;
        url      += '/' + exception.file;
        url      += '/' + exception.line;
        url      += '/' + exception.message;

        var title = 'Exception ' + exception.type;

        parameter.action_name = '' + title;
        parameter.url         = baseUrl + url;
        
        exception = null;

        this._dispatch();
    };

    /**
     * Logs an outlink or download link.
     * 
     * @param  {string}  sourceUrl  An absolute url without protocol and so on
     * @param  {string}  linkType   Either 'download' or 'outlink'
     */
    this.trackLink = function (sourceUrl, linkType) {

        parameter           = {url: currentUrl};
        parameter[linkType] = sourceUrl;

        this._dispatch();
    };

    /**
     * Sets (overrides) the document title.
     * 
     * @param  {string}  title
     *
     * @type   Piwik.Tracker
     */
    this.setDocumentTitle = function (title) {
        documentTitle = '' + title;

        return this;
    };

    /**
     * Sets (overrides) the current url.
     *
     * @param  {string}  title  An absolute url without protocol and so on.
     *
     * @type   Piwik.Tracker
     */
    this.setCurrentUrl = function (url) {
        currentUrl = baseUrl + url;

        return this;
    };

    /**
     * Set custom variable within this visit. All set custom variables will be recognized in the next tracking and
     * reset afterwards.
     *
     * @param  {number}  index  The index of the custom variable
     * @param  {string}  name   The number of the custom variable
     * @param  {string}  value  The value of the custom variable
     * @param  {string}  scope  Either 'page' or 'visit' scope.
     *                          - "visit" will store the name/value in the visit and will persist it in the cookie
     *                            for the duration of the visit
     *                          - "page" will store the name/value in the page view.
     */
    this.setCustomVariable = function (index, name, value, scope) {

        var key = 'cvar';
        if (scope && 'page' == scope) {
            key = 'cvar';
        } else if (scope && 'visit' == scope) {
            key = '_cvar';
        }

        if (!parameter[key]) {
            parameter[key] = {};
        }

        parameter[key]['' + index] = ['' + name, '' + value];
    };
    
    /**
     * Prepare visit scope custom variables to send them with the next page view.
     */
    this.prepareVisitCustomVariables = function () {
        
        var session     = Piwik.require('App/Session');
        var locale      = Piwik.require('Locale');
        var websites    = session.get('piwik_sites_allowed', []);
        var numWebsites = 0;
        var numAccounts = Piwik.require('App/Accounts').getNumAccounts();
        
        if (Piwik.isArray(websites) && 'undefined' !== (typeof websites.length)) {
            numWebsites = websites.length;
        }
            
        this.setCustomVariable(1, 'OS', Ti.Platform.osname + ' ' + Ti.Platform.version, 'visit');

        // Piwik Version
        this.setCustomVariable(2, 'Piwik Mobile Version', Ti.App.version, 'visit');

        // Locale of the device + configured locale
        this.setCustomVariable(3, 'Locale', Ti.Platform.locale + '::' + locale.getLocale(), 'visit');
        this.setCustomVariable(4, 'Num Accounts', numAccounts, 'visit');
        
        if (numWebsites) {
            this.setCustomVariable(5, 'Num Sites', numWebsites, 'visit');
        }
        
        session  = null;
        locale   = null;
        websites = null;
    };

    /**
     * Detects whether tracking is enabled or disabled. It considers the config as well as whether the user has allowed
     * tracking.
     *
     * @returns  {boolean}  true if tracking is enabled, false otherwise.
     */
    this.isEnabled = function () {

        if (!config.tracking.enabled) {

            return false;
        }

        var settings  = Piwik.require('App/Settings');
        var isEnabled = settings.isTrackingEnabled();
        settings      = null;

        return isEnabled;
    };

    /**
     * Executes/Dispatches a track. Track will only be dispatched if tracking is enabled. All required parameters will 
     * be set automatically. It does not send the request immediately. It just adds the request to the 
     * tracking queue.
     * 
     * @private
     */
    this._dispatch = function () {

        if (!this.isEnabled()) {
            
            // make sure nothing will be tracked from now on. Cancel even previous offered requests.
            queue.clear();

            return;
        }
        
        this._mixinDefaultParameter();

        queue.offer(parameter);

        parameter = {};
    };

    /**
     * Mixin all required default parameter needed to execute a tracking request. For example siteId, custom variables
     * with visit scope, resolution, uuid, visitcount and so on.
     */
    this._mixinDefaultParameter = function () {

        if (!parameter) {
            parameter    = {};
        }
        
        var now          = new Date();

        // session based parameters
        parameter.idsite = this.siteId;
        parameter.rand   = String(Math.random()).slice(2,8);
        parameter.h      = now.getHours();
        parameter.m      = now.getMinutes();
        parameter.s      = now.getSeconds();

        // 1 = record request, 0 = do not record request
        parameter.rec    = 1;
        parameter.apiv   = this.apiVersion;
        parameter.cookie = '';

        parameter.urlref = 'http://' + Ti.Platform.osname + '.mobileapp.piwik.org';

        // visitor based
        parameter._id    = uuid;

        // visit count
        parameter._idvc  = visitCount;

        var caps         = Ti.Platform.displayCaps;
        parameter.res    = caps.platformWidth + 'x' + caps.platformHeight;

        if (parameter._cvar) {
            parameter._cvar = JSON.stringify(parameter._cvar);
        }

        if (parameter.cvar) {
            parameter.cvar  = JSON.stringify(parameter.cvar);
        }
    };

    /**
     * Ask the user for anonymous tracking permission. User will only be asked if tracking is enabled. If user agrees,
     * the setting will automatically be enabled. If not, tracking will be still disabled. Make sure this method will
     * only executed once the user starts the app the first time.
     */
    this.askForPermission = function () {

        if (!config.tracking.enabled) {

            return;
        }

        var _ = require('library/underscore');

        // uuid does not exist, this means user starts the app the first time.
        // ask user whether he wants to enable or disable tracking
        var alertDialog = Ti.UI.createAlertDialog({
            title: _('Mobile_HelpUsToImprovePiwikMobile'),
            message: _('Mobile_AskForAnonymousTrackingPermission'),
            buttonNames: [_('General_Yes'), _('General_No')],
            cancel: 1
        });

        alertDialog.addEventListener('click', function (event) {

            if (!event) {

                return;
            }

            var settings = Piwik.require('App/Settings');

            switch (event.index) {
                case 0:

                    settings.setTrackingEnabled(true);

                    Ti.UI.createAlertDialog({message: _('Feedback_ThankYou'), ok: _('General_Ok') }).show();
                    break;

                case 1:
                default:

                    settings.setTrackingEnabled(false);
                    break;
            }
        });

        alertDialog.show();
    };

    this.init();
}

module.exports = new Tracker();