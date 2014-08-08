/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var _ = require('alloy/underscore');
var Alloy = require("alloy");
var PiwikApiError = require('Piwik/Network/PiwikApiError');

function InitAdapter(config) {
    
}

function getPersistentCache()
{
    var persistentCache = Alloy.createCollection('persistentCache');
    persistentCache.fetch();
    return persistentCache;
}

function getSessionCache()
{
    var sessionCache = Alloy.createCollection('sessionCache');
    sessionCache.fetch();
    return sessionCache;
}

var caches = {persistent: getPersistentCache(), session: getSessionCache()};

function isSuccessfulResponse(collection, response)
{
    var isResponseSet       = !_.isUndefined(response) && !_.isNull(response);
    var canValidateResponse = _.isFunction(collection.validResponse);
    var isInvalidResponse   = canValidateResponse && !collection.validResponse(response);

    return (isResponseSet && !isInvalidResponse);
}

function readFromApi(preparedRequest, onSuccess, onError)
{
    preparedRequest.onSuccess(onSuccess);
    preparedRequest.onError(onError);
    preparedRequest.send();

    onSuccess = null;
    onError   = null;
}

function prepareApiRequest(apiMethod, params, account, segmentModel)
{
    var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');

    var request = new PiwikApiRequest();
    request.setMethod(apiMethod);
    request.setParameter(params);

    if (account) {
        request.setBaseUrl(account.get('accessUrl'));
        request.setUserAuthToken(account.get('tokenAuth'));
    }

    if (segmentModel && segmentModel.getDefinition) {
        request.setSegment(segmentModel.getDefinition());
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

    var cachedResponse = JSON.parse(cachedEntry.getCachedValue());
    if (isSuccessfulResponse(collection, cachedResponse)) {
        return cachedResponse;
    }
}

function cacheResponse(cacheKey, cache, response)
{
    caches[cache.type].put(cacheKey, JSON.stringify(response), cache.time);
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

    var segment = opts.segment || null;

    collection.xhrRequest = prepareApiRequest(settings.method, params, opts.account, segment);

    if (useCache) {
        var cacheKey       = collection.xhrRequest.getUrl();
        var cachedResponse = tryToGetValidResponseFromCache(cacheKey, cache, collection);

        if (cachedResponse) {
            cleanupApiRequest(collection);
            opts.success && opts.success(cachedResponse);
            collection = null;
            return;
        }
    }

    readFromApi(collection.xhrRequest, function (response) {

        cleanupApiRequest(collection);

        if (isSuccessfulResponse(collection, response)) {
            useCache && cacheResponse(cacheKey, cache, response);
            opts.success && opts.success(response);
        } else {
            opts.error && opts.error(new PiwikApiError('Invalid Response', 'Response does not have the correct format.'));
        }

        collection = null;
        opts       = null;
        cache      = null;

    }, function (error) {

        cleanupApiRequest(collection);
        error && opts.error && opts.error(new PiwikApiError(error.error, error.message, error.platformErrorMessage));
        collection = null;
        opts       = null;
        cache      = null;
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