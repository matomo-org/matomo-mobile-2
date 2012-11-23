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
 * @class    The RequestPool can be used to send multiple http requests in parallel. It is possible to specify
 *           a callback method that will be executed as soon as all requests has received their response.
 *
 * @example
 * var pool = Piwik.require('Network/RequestPool');
 * pool.attach(request1);
 * pool.attach(request2)
 * pool.setContext(myContext);
 * pool.send(function () {});
 * 
 * @exports  RequestPool as Piwik.Network.RequestPool
 */
function RequestPool () {
    
    /**
     * A given callback method will be executed in this context. This means you can access the properties of the context
     * object within the callback using 'this'. 
     *
     * @see   Piwik.Network.RequestPool#setContext
     * 
     * @type  Object
     */
    this.context          = null;

    /**
     * Holds each attached request in this array. This gives us the possibility to send all these attached calls
     * at the same time in parallel. Each attached call is an instance of Piwik.Network.HttpRequest
     *
     * Array (
     *    [int] => <An instance of {@link Piwik.Network.HttpRequest}>
     * )
     * 
     * @type  Array
     */
    this.attachedRequests = [];

    /**
     * Counts each received response since multiple requests (simultaneously) has been fired. As soon as the number of
     * received calls is equal to the number of attached calls, we are able to call the 'onAllResultsReceivedCallback'
     * method therefore. This event/callback 'allResultsReceived' can be used for example to trigger the render process
     * or do some other final work.
     *
     * @default  "0"
     * 
     * @type     int
     */
    this.numReceivedCalls = 0;

    /**
     * This property is set to true as soon as an error message was sent to the user. Regardless of which attached
     * requests had an error. We do not want to inform the user more than once if an error occurs.
     *
     * @default  "false"
     *
     * @type     boolean
     */
    this.errorMessageSent = false;
}

/**
 * Sets (overwrites) the context.
 *
 * @param  {Object}  context  A given callback method will be executed in this context. This means you
 *                            can access the properties of the context object within the callback
 *                            using 'this'. See {@link Piwik.Network.RequestPool#context}
 */
RequestPool.prototype.setContext = function (context) {
    this.context = context;
    context      = null;
};

/**
 * Attach a request to send it simultaneously with other requests.
 * 
 * @param  {Piwik.Network.HttpRequest}  request
 */
RequestPool.prototype.attach = function (request) {
    this.attachedRequests.push(request);
    request = null;
};

/**
 * Fires each previous attached request nearly simultaneous.
 * 
 * @param  {Function}  onAllResultsReceivedCallback  This callback method is called as soon as all results has
 *                                                   been received. The method will be executed in the previous
 *                                                   set context. This method is called even if one of the 
 *                                                   requests failed.
 * 
 * @type   null
 *
 * @todo   create a setCallback(context, onAllResultsReceivedCallback) method, 
 *         see {@link Piwik.Network.HttpRequest#setCallback} or fire an event .fireEvent('onAllResultsReceivedCallback')
 * @todo   rename 'onAllResultsReceivedCallback' to 'onload'?
 */
RequestPool.prototype.send = function (onAllResultsReceivedCallback) {

    this.numReceivedCalls             = 0;
    this.onAllResultsReceivedCallback = onAllResultsReceivedCallback;
    onAllResultsReceivedCallback      = null;
    
    var call = null;
    var that = this;
    
    that.errorMessageSent = false;
    
    for (var index = 0; index < this.attachedRequests.length; index++) {
        call = this.attachedRequests[index];

        call.onload = function () {
            that.verifyAllResultsReceived();
        };

        // this makes sure an error will be displayed only once, even if all attached requests fail.
        call.onDisplayErrorAllowed = function () {

            if (!that.errorMessageSent) {
                that.errorMessageSent = true;
                
                return true;
            }

            return false;
        };

        if (call.send) {
            call.send();
        } else if (call.handle) {
            call.handle();
        }
        
        call = null;
    }
};

/**
 * Abort all previous fired requests. Does not execute any callback. Does not send any error message to the user.
 * Does reset the complete RequestPool after aborting each request.
 */
RequestPool.prototype.abort = function () {

    // make sure no callback method will be executed
    this.context                      = null;
    this.onAllResultsReceivedCallback = null;
    
    // make sure we don't send an error message to the user cause of this abort.
    this.errorMessageSent = true;

    // abort each request
    var call = null;
    while (this.attachedRequests && this.attachedRequests.length) {
        call = this.attachedRequests.pop();

        if (call.abort) {
            call.abort();
        }
        
        call = null;
    }

    // reset Request Pool
    this.numReceivedCalls = 0;
    this.attachedRequests = [];
};

/**
 * Verifies whether all results are finished by comparing the number of received calls and the number of
 * attached requests. Fires the 'onAllResultsReceivedCallback' as soon as this case occurs.
 */
RequestPool.prototype.verifyAllResultsReceived = function () {
    this.numReceivedCalls++;

    if (this.numReceivedCalls != this.attachedRequests.length) {

        return;
    }

    // we have to remove each registered call from the stack. otherwise each already sent request will be fired
    // multiple times - on each send()
    while (this.attachedRequests && this.attachedRequests.length) {
        this.attachedRequests.pop();
    }

    if (this.onAllResultsReceivedCallback) {
        try {
            this.onAllResultsReceivedCallback.apply(this.context, []);
        } catch (e) {
            Piwik.getLog().debug('Failed to call allResultsReceivedCallback: ' + e.message,
                                 'Piwik.Network.RequestPool::verifyAllResultsReceived');

            var uiError = Piwik.getUI().createError({exception: e, errorCode: 'PiRpVr18'});
            uiError.showErrorMessageToUser();
        }
    }

    this.numReceivedCalls             = 0;
    this.onAllResultsReceivedCallback = null;
    this.attachedRequests             = [];
    this.context                      = null;
};

module.exports = RequestPool;