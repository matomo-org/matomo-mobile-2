/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */


function InitAdapter(config) {
    
}

var _      = require('alloy/underscore');
var persistentCache = Alloy.createCollection('persistentCache');
persistentCache.fetch();

var sessionCache = Alloy.createCollection('sessionCache');
sessionCache.fetch();

var caches = {persistent: persistentCache,
              session: sessionCache};

function isSuccessfulResponse(collection, response)
{
    var isResponseSet       = !_.isUndefined(response) && !_.isNull(response);
    var canValidateResponse = _.isFunction(collection.validResponse);
    var isInvalidResponse   = canValidateResponse && collection.validResponse(response);

    return (isResponseSet && !isInvalidResponse);
}

function sendResponse(response, collection, opts, errorMessageDisplayed)
{
    if (isSuccessfulResponse(collection, response)) {

        opts.error && opts.error(collection, {errorMessageDisplayed: errorMessageDisplayed});

    } else {

        opts.success && opts.success(response);
    }
}

function readFromApi(preparedRequest, displayErrorIfOneOccurs, callback)
{
    preparedRequest.setCallback(callback);

    if (false === displayErrorIfOneOccurs) {
        preparedRequest.sendErrors = false;
    }

    preparedRequest.send();

    callback = null;
}

function prepareApiRequest(apiMethod, params, account)
{
    var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');

    var request = new PiwikApiRequest();
    request.setMethod(apiMethod);
    request.setParameter(params);

    if (account) {
        request.setBaseUrl(account.get('accessUrl'));
        request.setUserAuthToken(account.get('tokenAuth'));
    }

    return request;
}

function cleanupApiRequest(collection)
{
    if (collection.xhrRequest && collection.xhrRequest.cleanup) {
        collection.xhrRequest.cleanup();
    }

    collection.xhrRequest = null;
}

function tryToGetValidResponseFromCache(cacheKey, cache, collection)
{
    var cachedEntry = caches[cache.type].get(cacheKey);

    if (!cachedEntry) {
        return;
    }

    var cachedResponse = cachedEntry.getCachedValue();

    if (isSuccessfulResponse(collection, cachedResponse)) {
        return cachedResponse;
    }
}

function cacheValidResponse(cacheKey, cache, response, collection)
{
    if (isSuccessfulResponse(collection, response)) {
        caches[cache.type].put(cacheKey, response, cache.time);
    }
}

function Sync(method, collection, opts)
{
    if ('read' !== method) {
        console.debug('PiwikApiAdapter supports only reading');
        return;
    }

    var settings = collection.config.settings;
    var params   = collection.config.defaultParams;
    var cache    = collection.config.cache;
    var useCache = cache && cache.type && caches[cache.type];

    opts  = _.clone(opts || {});

    if (opts.params) {
        params = _.extend(_.clone(params), opts.params);
    }

    collection.xhrRequest = prepareApiRequest(settings.method, params, opts.account);

    if (useCache) {
        var cacheKey       = collection.xhrRequest.getUrl();
        var cachedResponse = tryToGetValidResponseFromCache(cacheKey, cache, collection);

        if (cachedResponse) {
            cleanupApiRequest(collection);
            sendResponse(cachedResponse, collection, opts, false);
            collection = null;
            return;
        }
    }

    readFromApi(collection.xhrRequest, settings.displayErrors, function (response) {

        if (useCache) {
            cacheValidResponse(cacheKey, cache, response, collection);
        }

        cleanupApiRequest(collection);
        sendResponse(response, collection, opts, this.errorMessageSent);

        collection = null;
    });
}

function addAbortXhrFeature (Collection)
{    
    Collection = Collection || {};

    Collection.prototype.abort = function ()
    {
        console.debug('Collection abort requested.');

        if (this.xhrRequest) {
            console.info('XHR found, will try to abort');
            this.xhrRequest.abort();
            cleanupApiRequest(this);
        }
    };

    Collection.prototype.abortRunningRequests = function ()
    {
        if (this.xhrRequest) {
            this.abort();
        }
    };

    return Collection;
}

module.exports.sync = Sync;
module.exports.afterCollectionCreate = addAbortXhrFeature;