/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik   = require('library/Piwik');

/**
 * @class    Can be used to send a GET http request to any url. Attend that synchronous requests are not supported at 
 *           the moment.
 *
 * @example
 * var request = Piwik.require('Network/HttpRequest');
 * request.setBaseUrl('http://demo.piwik.org/');
 * request.setParameter({siteId: 5});
 * request.setCallback(anyContext, function (response, parameters) {});
 * request.handle();
 * 
 * @exports  HttpRequest as Piwik.Network.HttpRequest
 */
function HttpRequest () {
    
    /**
     * Holds the base url.
     * 
     * @type  String
     *
     * @see   Piwik.Network.HttpRequest#setBaseUrl
     * 
     * @private
     */
    this.baseUrl          = null;
    
    /**
     * A given callback method will be executed in this context. This means you can access the properties of the context
     * object within the callback using 'this'. 
     *
     * @see   Piwik.Network.HttpRequest#setCallback
     * 
     * @type  Object
     */
    this.context          = null;

    /**
     * We have to inform the user if no network connection is available. Apple requires this. Additionally, we want to
     * inform the user if the request timed out or the url does not exist. This property is set to true as soon as an
     * error message was sent to the user. We do not want to inform the user more than once if an error occurs.
     * 
     * @default  "false"
     *
     * @type     boolean
     */
    this.errorMessageSent = false;
    
    /**
     * Disables the notification of an error message to the user on any error. Disable this only if a request is totally 
     * unimportant and does not effect the app. This is important because Apple requires to inform the user if 
     * no network connection is available.
     * 
     * @default  "true"
     *
     * @type     boolean
     */
    this.sendErrors       = true;
    
    /**
     * The handleAs parameter specifices how to parse the received data before the callback method is called.
     * Supported values are 'json', 'xml' and 'text'.
     * 
     * @default  "text"
     *
     * @type     string
     */
    this.handleAs         = 'text';
    
    /**
     * The user agent used when sending requests.
     * 
     * @default  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1"
     *
     * @type     string
     */
    this.userAgend        = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1';

    /**
     * An object containing key/value pairs. These are used as GET parameters when executing the request.
     *
     * @see   Piwik.Network.HttpRequest#setParameter
     *
     * @type  Object|null
     */
    this.parameter        = null;

    /**
     * The callback method will be executed as soon as the readyState is finished. The callback method will be executed
     * in context of {@link Piwik.Network.HttpRequest#context}. The callback method will be executed on a valid result
     * and on any error. If an error occurred, it does not pass the result to the callback method.
     *
     * @see   Piwik.Network.HttpRequest#setCallback
     *
     * @type  Function|null
     */
    this.callback         = null;

    /**
     * An instance of the Titanium HTTP Client instance we have used to send the request. Is only set if the request is
     * currently in progress.
     *
     * @type  Titanium.Network.HTTPClient
     */
    this.xhr              = null;
}

/**
 * Sets (overwrites) the base url.
 * 
 * @param  {string}  baseUrl  An url without any GET parameter/Query. For example: 'http://domain.tld/dir/ectory'.
 *                            Do not include GET parameter like this 'http://domain.tld/dir/ectory?' or 
 *                            'http://domain.tld/dir/ectory?key=1&key2=2'. 
 *                            Use {@link Piwk.Network.HttpRequest#setParameter} instead.
 * 
 * @type   null
 */
HttpRequest.prototype.setBaseUrl = function (baseUrl) {

    if (baseUrl && 'string' === (typeof baseUrl).toLowerCase() && 4 < baseUrl.length) {
        this.baseUrl = baseUrl;
    }

    baseUrl = null;
};

/**
 * Sets (overwrites) the GET parameters.
 *
 * @param  {Object}  parameter  An object containing key/value pairs, see {@link Piwik.Network.HttpRequest#parameter}
 *
 * @type   null
 */
HttpRequest.prototype.setParameter = function (parameter) {
    this.parameter = parameter;
    parameter      = null;
};

/**
 * Sets (overwrites) the callback method and the context. The context object defines in which context the callback
 * method will be executed.
 *
 * @param  {Object}    context     A given callback method will be executed in this context. This means you
 *                                 can access the properties of the context object within the callback
 *                                 using 'this'. See {@link Piwik.Network.HttpRequest#context}
 * @param  {Function}  [callback]  Optional. The callback is called as soon as the response is received.
 *                                 The callback is called even on any error. Possible errors are:
 *                                 Network is not available, no base url is given, timeout, ...
 *                                 In such a case the callback method does not receive the response as an
 *                                 argument. Ensure that your callback method is able to handle such a case.
 *                                 The first argument the method does receive is the response, the second is
 *                                 the used parameters. See {@link Piwik.Network.HttpRequest#callback}
 */
HttpRequest.prototype.setCallback = function (context, callback) {
    this.context  = context;
    this.callback = callback;
    
    callback      = null;
    context       = null;
};

/**
 * Fires a single http request. Fires a callback method as soon as the response is received. Make sure to set
 * all data needed to handle the request before calling this method.
 */
HttpRequest.prototype.handle = function () {

    var parameter    = this.parameter;

    if (!parameter) {
        parameter    = {};
    }
    
    if (!this.context) {
        this.context = {};
    }

    if (!this.baseUrl) {

        this.error({error: 'Missing base url'});
        
        return;
    }

    if (!Ti.Network || !Ti.Network.online) {
        
        this.error({error: 'No connection'});

        return;
    }

    var requestUrl  = '';
    
    if (parameter) {
        
        requestUrl += '?';
        for (var paramName in parameter) {
            requestUrl += paramName + '=' + parameter[paramName] + '&';
        }
    }
   
    requestUrl       = this.baseUrl + Piwik.getNetwork().encodeUrlParams(requestUrl);
    
    Piwik.getLog().debug('RequestUrl is ' + requestUrl, 'Piwik.Network.HttpRequest::handle');
    
    this.xhr         = Ti.Network.createHTTPClient({validatesSecureCertificate: false, enableKeepAlive: false});
    var that         = this;
    
    this.xhr.onload  = function () { that.load(this); that = null; };
    this.xhr.onerror = function (e) { 
        if ('undefined' == (typeof e)) {
            e = null;
        }
        
        that.error(e); 
        that = null; 
    };

    var settings     = Piwik.require('App/Settings');
    
    // override the iPhone default timeout
    var timeoutValue = parseInt(settings.getHttpTimeout(), 10);
    this.xhr.setTimeout(timeoutValue);

    this.xhr.open("GET", requestUrl);

    if (this.userAgend) {
        this.xhr.setRequestHeader('User-Agent', this.userAgent);
    }

    this.xhr.send({});
    
    parameter = null;
    settings  = null;
};

/**
 * Abort a pending request. Does not send any error to the user about this report. Does not call any callback
 * method.
 *
 * @returns  {boolean}  True if there was a pending request which we have aborted. False otherwise.
 */
HttpRequest.prototype.abort = function () {

    if (this.xhr && this.xhr.abort) {

        // make sure not to notify the user about this abort
        this.sendErrors = false;
        
        // make sure no callback method will be called.
        this.setCallback({}, function () {});
        
        this.xhr.abort();

        return true;
    }

    return false;
};

/**
 * This method will be executed as soon as the response is received. Parses the response, validates it and calls
 * the callback method on success.
 *
 * @param  {Titanium.Network.HTTPClient}  xhr  The used xhr request which contains the received response.
 */
HttpRequest.prototype.load = function (xhr) {

    Piwik.getLog().debug('Received response ' + xhr.responseText, 'Piwik.Network.HttpRequest::load');

    try {
        // parse response
        var response;

        if ('json' === this.handleAs) {

            response = JSON.parse(xhr.responseText);

        } else if ('text' === this.handleAs) {

            response = xhr.responseText;

        } else if ('xml' === this.handleAs) {

            response = xhr.responseXML;
        }

    } catch (exception) {

        Piwik.getUI().createError({exception: exception, errorCode: 'PiHrLo26'});

        this.error({error: 'Failed to parse response'});

        return;
    }

    // validate response
    var isValidResponse = this.isValidResponse(response);

    if (!isValidResponse) {
        response        = null;
        xhr             = null;

        this.error({error: 'Invalid response'});

        return;
    }

    var callback  = this.callback;
    if (!callback) {
        callback  = new Function();
    }

    var parameter = this.parameter;

    try {
        // execute callback in defined context
        callback.apply(this.context, [response, parameter]);
 
    } catch (e) {
        Piwik.getLog().warn('Failed to call callback method: ' + e.message, 
                            'Piwik.Network.HttpRequest::load#callback');

        var uiError = Piwik.getUI().createError({exception: e, errorCode: 'PiHrLo29'});
        uiError.showErrorMessageToUser();
    }

    // onload hook
    if (this.onload) {
        this.onload();
    }

    parameter = null;
    callback  = null;
    response  = null;
    xhr       = null;
    
    this.cleanup();
};

/**
 * This method will be executed on any error. Displays a notification about the occurred error, if sendErrors is
 * enabled and if no error message was already sent. Executes the previous defined callback method afterwards.
 *
 * @param  {Object}  e  An Error Object that contains at least a property named error.
 */
HttpRequest.prototype.error = function (e) {
    
    if ('undefined' == (typeof e)) {
        e = null;
    }

    Piwik.getLog().warn(e, 'Piwik.Network.HttpRequest::error');
    
    var _         = require('library/underscore');
    // if set, the user will see a dialog containing this message
    var message   = '';
    // the title of the message
    var title     = _('General_Error');
    // null|string|Error if set, the error will be tracked
    var exception = null;
    // the type of the error, for example TypeError, SyntaxError, ...
    var errorType = 'RequestError';
    var baseUrl   = '' + this.baseUrl;
    
    if ((!e || !e.error) && this.xhr && 200 != this.xhr.status) {
        
        exception = this.xhr.statusText ? this.xhr.statusText : this.xhr.status;
        message   = String.format(_('Mobile_NetworkErrorWithStatusCode'), 'Unknown', '' + exception, baseUrl);
        
    } else if (e && e.error) {
        
        e.error = '' + e.error;
        var originalErrorMessage = e.error;

        if (-1 != e.error.indexOf('Host is unresolved') || -1 != e.error.indexOf('Unable to resolve host')) {
            // convert error message "Host is unresolved: notExistingDomain.org:80" to: "Host is unresolved" and 
            // Unable to resolve host "example.com": No address associated with hostname.
            e.error = 'Host is unresolved';
        }
        
        // ASIHTTPRequestErrorDomain errors
        if (-1 != e.error.indexOf('A connection failure occurred')) {
            e.error = 'A connection failure occurred';
        } else if (-1 != e.error.indexOf('The request timed out')) {
            e.error = 'The request timed out';
        } else if (-1 != e.error.indexOf('Authentication needed')) {
            e.error = 'Authentication needed';
        } else if (-1 != e.error.indexOf('Unable to create request')) {
            e.error = 'Unable to create request (bad url?)';
        } else if (-1 != e.error.indexOf('The request failed because it redirected too many times')) {
            e.error = 'The request failed because it redirected too many times';
        } else if (-1 != e.error.indexOf('Unable to start HTTP connection')) {
            e.error = 'Unable to start HTTP connection';
        } else if (-1 != e.error.indexOf('SSL problem')) {
            e.error = 'SSL problem (Possible causes may include a bad/expired/self-signed certificate, clock set to wrong date)';
        } else if (-1 != e.error.indexOf('Service Temporarily Unavailable')) {
            e.error = 'Service Temporarily Unavailable';
        } else if (-1 != e.error.indexOf('Internal Server Error')) {
            e.error = 'Internal Server Error';
        } else if (-1 != e.error.indexOf('Connection reset by peer')) {
            // recvfrom failed: ECONNRESET (Connection reset by peer
            e.error = 'Connection reset by peer';
        } else if (-1 != e.error.indexOf('Cannot convert host to URI')) {
            e.error = 'Cannot convert host to URI';
        } else if (-1 != e.error.indexOf('The target server failed to respond')) {
            e.error = 'The target server failed to respond';
        } else if (-1 != e.error.indexOf('Gateway Time-out')) {
            e.error = 'Gateway Time-out';
        } else if (-1 != e.error.indexOf('The target server failed to respond')) {
            e.error = 'The target server failed to respond';
        } else if (-1 != e.error.indexOf('SSL handshake aborted')) {
            e.error = 'SSL handshake aborted: Failure in SSL library, usually a protocol error';
        } else if (-1 != e.error.indexOf('java.net.SocketTimeoutException')) {
            e.error = 'SocketTimeoutException';
        } else if (-1 != e.error.indexOf('SSL shutdown failed')) {
            e.error = 'SSL shutdown failed I/O error during system call';
        } else if (-1 != e.error.indexOf('Connection timed out')) {
            // recvfrom failed: 
            e.error = 'ETIMEDOUT Connection timed out';
        } else if (-1 != e.error.indexOf('Connect to') && -1 != e.error.indexOf('timed out')) {
            e.error = 'Connect timed out';
        } else if (-1 != e.error.indexOf('Connect to') && -1 != e.error.indexOf('refused')) {
            e.error = 'Connect refused';
        }

        switch (e.error.toLowerCase()) {

            case 'no connection':
                // apple requires that we inform the user if no network connection is available
                
                title   = _('Mobile_NetworkNotReachable');
                message = _('Mobile_YouAreOffline');
    
                break;
    
            case 'request aborted':
            case 'timeout':
            case 'the request timed out':
            case 'chunked stream ended unexpectedly':
    
                message = String.format(_('General_RequestTimedOut'), baseUrl);
    
                break;
    
            case 'host is unresolved':
            case 'not found':
    
                message = String.format(_('General_NotValid'), baseUrl);
    
                break;
    
            case 'missing base url':
    
                // ignore this error, user has not already set up the app
                break;
    
            default:
                /**
                 * further known error codes:
                 * 'Failed to parse response' -> we set this error if we were not able to parse the response
                 * 'Manager is shut down.'    -> don't know what this exactly means
                 * 'No wrapped connection'    -> don't know what this exactly means
                 * 'Adapter is detached'      -> don't know what this exactly means
                 * 'Timeout waiting for connection' 
                 * 'Connection not obtained from this manager.'
                 */
                
                var statusText = '';
                errorType      = e.error;
                exception      = originalErrorMessage;

                if (this.xhr && 'undefined' != (typeof this.xhr.status)) {
                    statusText  = '' + (this.xhr.statusText ? this.xhr.statusText : this.xhr.status);
                    errorType  += '-' + this.xhr.status;
                }
                
                message = String.format(_('Mobile_NetworkErrorWithStatusCode'), e.error, statusText, baseUrl);
        }
    }
    
    if (message && this.displayErrorAllowed()) {
        this.errorMessageSent = true;

        var alertDialog = Ti.UI.createAlertDialog({
            title: title,
            message: message,
            buttonNames: [_('General_Ok')]
        });

        alertDialog.show();
        alertDialog = null;
        
        if (exception) {
            Piwik.getUI().createError({exception: exception, type: errorType,
                                       file: 'Piwik/Network/HttpRequest.js', 
                                       errorCode: 'PiHrLe39'});
        }
    }

    var callback  = this.callback;
    if (!callback) {
        callback  = function () {};
    }

    callback.apply(this.context, []);

    // onload hook
    if (this.onload) {
        this.onload();
    }

    callback = null;
    e        = null;
    
    this.cleanup();
};

/**
 * Detects whether it is ok to display an error message. 
 *
 * @returns  {boolean}  true if we are allowed to display an error message, false otherwise.
 */
HttpRequest.prototype.displayErrorAllowed = function () {
    if (!this.sendErrors) {
        // displaying errors are not allowed for this request

        return false;
    }

    if (this.errorMessageSent) {
        // an error message was already displayed. Do not display an error again.

        return false;
    }

    if (this.onDisplayErrorAllowed) {

        return this.onDisplayErrorAllowed();
    }

    return true;
};

/**
 * Cleanup all references to avoid memory leaks.
 */
HttpRequest.prototype.cleanup = function () {

    this.xhr       = null;
    this.parameter = null;
    this.context   = null;
    this.callback  = null;
    this.onload    = null;
};

/**
 * The onload method will be called as soon as the load or error event was executed. 
 */
HttpRequest.prototype.onload = function () {
    // overwrite me
};

/**
 * Is called to validate the response before the success callback method will be called. If the response is not
 * valid, the errorHandler will be triggered which notifies the user about an error.
 * 
 * @param    {Object|null}  response  The received response.
 * 
 * @returns  {boolean}      true if the response is valid, false otherwise.
 */
HttpRequest.prototype.isValidResponse = function (response) {
    response = null;
    
    return true;
};

module.exports = HttpRequest;