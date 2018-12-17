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

/**
 * @class    Can be used to send a GET http request to any url. Attend that synchronous requests are not supported at 
 *           the moment.
 *
 * @example
 * var request = require('Piwik/Network/HttpRequest');
 * request.setBaseUrl('http://demo.matomo.org/');
 * request.setParameter({siteId: 5});
 * request.setCallback(function (response, parameters) {});
 * request.handle();
 */
function HttpRequest () {
    
    /**
     * Holds the base url.
     * 
     * @type  String
     *
     * @see   HttpRequest#setBaseUrl
     * 
     * @private
     */
    this.baseUrl = null;

    /**
     * The user agent used when sending requests.
     * 
     * @default  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1"
     *
     * @type     string
     */
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1';

    /**
     * An object containing key/value pairs. These are used as GET parameters when executing the request.
     *
     * @see   HttpRequest#setParameter
     *
     * @type  Object|null
     */
    this.parameter = null;

    /**
     * The callback method will be executed as soon as the readyState is finished. The callback method will be executed
     * in context of HttpRequest. The successCallback method will be executed on a valid result, the errorCallback
     * on any error.
     *
     * @see   HttpRequest#setCallback
     *
     * @type  Function|null
     */
    this.successCallback = null;
    this.errorCallback   = null;

    /**
     * An instance of the Titanium HTTP Client instance we have used to send the request. Is only set if the request is
     * currently in progress.
     *
     * @type  Titanium.Network.HTTPClient
     */
    this.xhr = null;
}

/**
 * Sets (overwrites) the base url.
 * 
 * @param  {string}  baseUrl  An url without any GET parameter/Query. For example: 'http://domain.tld/dir/ectory'.
 *                            Do not include GET parameter like this 'http://domain.tld/dir/ectory?' or 
 *                            'http://domain.tld/dir/ectory?key=1&key2=2'. 
 *                            Use {@link HttpRequest#setParameter} instead.
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
 * @param  {Object}  parameter  An object containing key/value pairs, see {@link HttpRequest#parameter}
 *
 * @type   null
 */
HttpRequest.prototype.setParameter = function (parameter) {
    this.parameter = parameter;
    parameter      = null;
};

/**
 * Sets (overwrites) the callback method.
 *
 * @param  {Function}  callback  The callback is called as soon as the response is received.
 *                               The callback is called even on any error. Possible errors are:
 *                               Network is not available, no base url is given, timeout, ...
 *                               In such a case the callback method does not receive the response as an
 *                               argument. Ensure that your callback method is able to handle such a case.
 */
HttpRequest.prototype.onSuccess = function (callback) {
    this.successCallback = callback;
    callback = null;
};

HttpRequest.prototype.onError = function (callback) {
    this.errorCallback = callback;
    callback = null;
};

HttpRequest.prototype.getRequestUrl = function () {

    var buildEncodedUrlQuery = require('url').buildEncodedUrlQuery;
    var requestUrl = buildEncodedUrlQuery(this.parameter || {});
    
    console.debug('RequestUrl is ' + requestUrl, 'HttpRequest::handle');

    return requestUrl;
};

/**
 * Fires a single http request. Fires a callback method as soon as the response is received. Make sure to set
 * all data needed to handle the request before calling this method.
 */
HttpRequest.prototype.handle = function () {

    if (!this.baseUrl) {

        this.error({error: 'Missing base url'});
        
        return;
    }

    if (!Ti.Network || !Ti.Network.online) {
        
        this.error({error: 'No connection'});

        return;
    }

    var settings    = Alloy.createCollection('AppSettings').settings();
    var validateSsl = settings.shouldValidateSsl();

    this.xhr = Ti.Network.createHTTPClient({validatesSecureCertificate: validateSsl, enableKeepAlive: false});
    var that = this;
    
    this.xhr.onload  = function () { that.load(this); that = null; };
    this.xhr.onerror = function (e) { 
        if ('undefined' == (typeof e)) {
            e = null;
        }

        if (that) {
            that.error(e);
            that = null;
        }
    };

    // override the iPhone default timeout
    var timeoutValue = parseInt(settings.httpTimeout(), 10);
    this.xhr.setTimeout(timeoutValue);

    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    this.xhr.open('POST', this.baseUrl);
    
    if (this.userAgent) {
        this.xhr.setRequestHeader('User-Agent', this.userAgent);
    }

    this.xhr.send(this.getRequestUrl());
    
    settings = null;
};

/**
 * Abort a pending request. Does not send any error to the user about this report. Does not call any callback
 * method.
 *
 * @returns  {boolean}  True if there was a pending request which we have aborted. False otherwise.
 */
HttpRequest.prototype.abort = function () {
    if (this.xhr && this.xhr.abort) {
        
        // make sure no callback method will be called.
        this.onSuccess(null);
        this.onError(null);
        
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

    console.debug('Received response ' + xhr.responseText, 'HttpRequest::load');

    // parse response
    var response;

    try {
        response = JSON.parse(xhr.responseText);

    } catch (exception) {

        var tracker = require('Piwik/Tracker');
        tracker.trackException({error: exception, errorCode: 'PiHrLo26'});

        this.error({error: 'Failed to parse response'});

        return;
    }

    // validate response
    var errorMessage = this.getErrorIfInvalidResponse(response);

    if (errorMessage) {
        response = null;
        xhr      = null;

        this.error({error: errorMessage});

        return;
    }

    try {
        if (this.successCallback) {
            this.successCallback.apply(this, [response]);
        }
 
    } catch (e) {
        console.warn('Failed to call success callback method: ' + e.message, 'HttpRequest::load#callback');
        require('Piwik/Tracker').trackException({error: e, errorCode: 'PiHrLo29'});
    }

    response = null;
    xhr      = null;
    
    this.cleanup();
};

function convertXhrStatusCodeToHumanReadable(statusCode)
{
    return String.format(L('Mobile_NetworkErrorWithStatusCodeShort'), statusCode + '');
}

function convertXhrErrorMessageToHumanReadable (xhrError) {
    if (-1 != xhrError.indexOf('Host is unresolved') || -1 != xhrError.indexOf('Unable to resolve host')) {
        // convert error message "Host is unresolved: notExistingDomain.org:80" to: "Host is unresolved" and
        // Unable to resolve host "example.com": No address associated with hostname.
        xhrError = 'Host is unresolved';
    }

    // ASIHTTPRequestErrorDomain errors
    if (-1 != xhrError.indexOf('A connection failure occurred')) {
        xhrError = 'A connection failure occurred';
    } else if (-1 != xhrError.indexOf('The request timed out')) {
        xhrError = 'The request timed out';
    } else if (-1 != xhrError.indexOf('Authorization Required')) {
        xhrError = 'Authentication needed';
    } else if (-1 != xhrError.indexOf('Authentication needed')) {
        xhrError = 'Authentication needed';
    } else if (-1 != xhrError.indexOf('Unable to create request')) {
        xhrError = 'Unable to create request (bad url?)';
    } else if (-1 != xhrError.indexOf('The request failed because it redirected too many times')) {
        xhrError = 'The request failed because it redirected too many times';
    } else if (-1 != xhrError.indexOf('Unable to start HTTP connection')) {
        xhrError = 'Unable to start HTTP connection';
    } else if (-1 != xhrError.indexOf('SSL problem')) {
        xhrError = 'SSL problem (Possible causes may include a bad/expired/self-signed certificate, clock set to wrong date)';
    } else if (-1 != xhrError.indexOf('Service Temporarily Unavailable')) {
        xhrError = 'Service Temporarily Unavailable';
    } else if (-1 != xhrError.indexOf('Internal Server Error')) {
        xhrError = 'Internal Server Error';
    } else if (-1 != xhrError.indexOf('Connection reset by peer')) {
        // recvfrom failed: ECONNRESET (Connection reset by peer
        xhrError = 'Connection reset by peer';
    } else if (-1 != xhrError.indexOf('Cannot convert host to URI')) {
        xhrError = 'Cannot convert host to URI';
    } else if (-1 != xhrError.indexOf('The target server failed to respond')) {
        xhrError = 'The target server failed to respond';
    } else if (-1 != xhrError.indexOf('Gateway Time-out')) {
        xhrError = 'Gateway Time-out';
    } else if (-1 != xhrError.indexOf('The target server failed to respond')) {
        xhrError = 'The target server failed to respond';
    } else if (-1 != xhrError.indexOf('SSL handshake aborted')) {
        xhrError = 'SSL handshake aborted: Failure in SSL library, usually a protocol error';
    } else if (-1 != xhrError.indexOf('java.net.SocketTimeoutException')) {
        xhrError = 'SocketTimeoutException';
    } else if (-1 != xhrError.indexOf('SSL shutdown failed')) {
        xhrError = 'SSL shutdown failed I/O error during system call';
    } else if (-1 != xhrError.indexOf('Connection timed out')) {
        // recvfrom failed:
        xhrError = 'ETIMEDOUT Connection timed out';
    } else if (-1 != xhrError.indexOf('ETIMEDOUT')) {
        // recvfrom failed:
        xhrError = 'ETIMEDOUT Connection timed out';
    } else if (-1 != xhrError.indexOf('Connect to') && -1 != xhrError.indexOf('timed out')) {
        xhrError = 'Connect timed out';
    } else if (-1 != xhrError.indexOf('Connect to') && -1 != xhrError.indexOf('refused')) {
        xhrError = 'Connect refused';
    }

    return xhrError;
}

/**
 * This method will be executed on any error. Executes the previous defined error callback method.
 *
 * @param  {Object}  e  An Error Object that contains at least a property named error.
 */
HttpRequest.prototype.error = function (e) {
    
    if ('undefined' == (typeof e)) {
        e = null;
    }

    if (e) {
        console.warn(e.error, 'HttpRequest::error');
    } else {
        console.warn('HttpRequest::error');
    }
    
    var L         = require('L');
    // if set, the user will see a dialog containing this message
    var message   = '';
    // the title of the message
    var title     = L('Mobile_NetworkError');
    // null|string|Error if set, the error will be tracked
    var exception = null;
    // the type of the error, for example TypeError, SyntaxError, ...
    var errorType = 'RequestError';
    var baseUrl   = '' + this.baseUrl;
    var platformErrorMessage = L('General_Unknown');
    
    var httpStatusCode = 0;
    if (this.xhr && this.xhr.status) {
        httpStatusCode = this.xhr.status;
    }

    if ((!e || !e.error) && this.xhr && 200 != this.xhr.status) {
        
        exception = this.xhr.statusText ? this.xhr.statusText : this.xhr.status;
        title     = convertXhrStatusCodeToHumanReadable(this.xhr.status);
        message   = String.format(L('Mobile_NetworkErrorWithStatusCode'), platformErrorMessage, '' + exception, baseUrl);
        platformErrorMessage = String.format(L('Mobile_NetworkErrorWithStatusCodeShort'), platformErrorMessage + ' (' + exception + ')');
        
    } else if (e && e.error) {

        platformErrorMessage = '' + e.error;
        var errorMessage = convertXhrErrorMessageToHumanReadable(platformErrorMessage);

        switch (errorMessage.toLowerCase()) {

            case 'no connection':
                // apple requires that we inform the user if no network connection is available
                
                title   = L('Mobile_NetworkNotReachable');
                message = L('Mobile_YouAreOffline');
    
                break;
    
            case 'request aborted':
            case 'timeout':
            case 'the request timed out':
            case 'etimedout connection timed out':
            case 'chunked stream ended unexpectedly':

                title   = L('Mobile_RequestTimedOutShort');
                message = String.format(L('General_RequestTimedOut'), baseUrl);
    
                break;
    
            case 'authentication needed':

                message = 'Authentication is needed. Please read more here: https://matomo.org/faq/mobile-app/#faq_16336';
                break;
    
            case 'host is unresolved':
            case 'not found':

                message = String.format(L('General_NotValid'), baseUrl);
    
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
                errorType      = e.error + '';
                exception      = e.error + '';

                if (this.xhr && ('undefined' != (typeof this.xhr.status))) {
                    statusText  = '' + (this.xhr.statusText ? this.xhr.statusText : this.xhr.status);
                    errorType  += '-' + this.xhr.status;
                }
                
                message = String.format(L('Mobile_NetworkErrorWithStatusCode'), errorMessage, statusText, baseUrl);
        }
    }

    if (exception) {
        require('Piwik/Tracker').trackException({error: exception, type: errorType, errorCode: 'PiHrLe39',
                                                 file: 'Piwik/Network/HttpRequest.js'});
    }

    try {
        if (this.errorCallback) {
            this.errorCallback.apply(this, [{error: title , message: message, platformErrorMessage: platformErrorMessage, httpStatusCode: httpStatusCode}]);
        }

    } catch (e) {
        console.warn('Failed to call error callback method: ' + e.message, 'HttpRequest::load#callback');
        require('Piwik/Tracker').trackException({error: e, errorCode: 'PiHrEr17'});
    }

    e = null;
    
    this.cleanup();
};

/**
 * Cleanup all references to avoid memory leaks.
 */
HttpRequest.prototype.cleanup = function () {

    this.xhr       = null;
    this.parameter = null;
    this.errorCallback   = null;
    this.successCallback = null;
};

/**
 * Is called to validate the response before the success callback method will be called. If the response is not
 * valid, the errorHandler will be triggered.
 * 
 * @param    {Object|null}  response  The received response.
 * 
 * @returns  {string|null}  An error message if response is invalid, null otherwise.
 */
HttpRequest.prototype.getErrorIfInvalidResponse = function (response) {
    response = null;
    return null;
};

module.exports = HttpRequest;
