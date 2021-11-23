/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

/**
 * Matomo - Web Analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

function getSettings()
{
    return Alloy.createCollection('AppSettings').settings();
}
 
/**
 * @class    Piwik Tracker tracks page views, events and so on to a configured Piwik Server installation. Tracking
 *           can be configured in config.js. Sends the requests async. The tracking is anonymous and will only be
 *           executed if user has enabled tracking and if tracking is enabled in configuration. Make sure no user
 *           data will be sent to the Piwik Server installation. For example the name of a website (via DocumentTitle)
 *           and so on.
 *
 * @static
 */
function Tracker () {


    /**
     * Initializes the tracker.
     */
    this.init = function () {

    };

    /**
     * Get the unique visitor id. If no visitor id exists, it'll arrange the generation of an uuid.
     *
     * @type  string
     *
     * @private
     */
    this._getUniqueId = function () {

        
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

        return;
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

        return 1;
    };
    
    /**
     * Tracks a window. It'll always detect the controller / action depending on the given url. Call this method if 
     * a window gets focus. For more information see {@link Piwik.Tracker#trackPageView}.
     * 
     * @param  {string}  title      The window's title.
     * @param  {string}  windowUrl  A window url, for example "site/index". In this case, "site" is the controller
     *                              and "index" is the action. It'll track the Title "site index" and the url
     *                              "/window/site/index".
     */
    this.trackWindow = function (title, windowUrl) {
        
    };

    /**
     * Log a page view. A page view is for example a new opened window or navigating to an already opened window.
     * Make sure you've set a document title {@link Piwik.Tracker#setDocumentTitle} and current url
     * {@link Piwik.Tracker#setCurrentUrl} before.
     */
    this.trackPageView = function () {

    };

    /**
     * Logs an event. An event is for example a click or a setting change.
     *
     * @param  {Object}  event
     * @param  {string}  event.title  The title of the event.
     * @param  {string}  event.url    An absolute url to identify this event without protocol and so on.
     */
    this.trackEvent = function (event) {

    };

    /**
     * Track a specific goal. Make sure you've set a document title before. Uses the last set url automatically.
     * 
     * @param  {number}  goalId
     */
    this.trackGoal = function (goalId) {

    };

    /**
     * Logs an exception.
     *
     * @param  {Object}  exception
     * @param  {Error}   exception.error      An optional instance of Error
     * @param  {string}  exception.file       The name of the file where the exception was thrown.
     * @param  {string}  exception.line       The number of the line where the exception was thrown.
     * @param  {string}  exception.message    The exception message.
     * @param  {string}  exception.type       The name of the exception, for example TypeError.
     * @param  {string}  exception.errorCode  An absolute url to identify this event without protocol and so on.
     */
    this.trackException = function (exception) {

    };

    /**
     * Logs an outlink or download link.
     * 
     * @param  {string}  sourceUrl  An absolute url without protocol and so on
     * @param  {string}  linkType   Either 'download' or 'outlink'
     */
    this.trackLink = function (sourceUrl, linkType) {

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

    };
    
    /**
     * Prepare visit scope custom variables to send them with the next page view.
     */
    this.prepareVisitCustomVariables = function () {
        
    };

    /**
     * Detects whether tracking is enabled or disabled. It considers the config as well as whether the user has allowed
     * tracking.
     *
     * @returns  {boolean}  true if tracking is enabled, false otherwise.
     */
    this.isEnabled = function () {
		return false;
    };

    /**
     * Executes/Dispatches a track. Track will only be dispatched if tracking is enabled. All required parameters will 
     * be set automatically. It does not send the request immediately. It just adds the request to the 
     * tracking queue.
     * 
     * @private
     */
    this._dispatch = function () {

    };

    /**
     * Mixin all required default parameter needed to execute a tracking request. For example siteId, custom variables
     * with visit scope, resolution, uuid, visitcount and so on.
     */
    this._mixinDefaultParameter = function () {

    };

    /**
     * Ask the user for anonymous tracking permission. User will only be asked if tracking is enabled. If user agrees,
     * the setting will automatically be enabled. If not, tracking will be still disabled. Make sure this method will
     * only executed once the user starts the app the first time.
     */
    this.askForPermission = function () {

    };

    this.init();
}

module.exports = new Tracker();
