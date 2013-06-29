/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function getBaseCache()
{
    var Alloy = require('alloy');
    var cache = Alloy.createCollection('baseCache');

    return cache;
}

function getCacheModel(cacheEntry)
{
    var Alloy = require('alloy');
    var cache = Alloy.createModel('baseCache', cacheEntry);

    return cache;
}

function getCurrentTimestamp ()
{
    return Math.floor(new Date().getTime() / 1000);
}

function serializeObjectForComparison(obj)
{
    return JSON.stringify(obj);
}

function expectNumberOfEntriesToBeInCache(cache, numEntries)
{
    expect(cache.length).toEqual(numEntries);
}

describe('baseCache collection', function() {

    it('should have no cache entries by default', function() {
        var cache = getBaseCache();
        cache.fetch();

        expectNumberOfEntriesToBeInCache(cache, 0);
    });

    it('should have one cache entry after putting a value', function() {
        var cache = getBaseCache();

        cache.put('testkey', 'myvalue', 10);

        expectNumberOfEntriesToBeInCache(cache, 1);
    });

    it('should return a cached value by cache key', function() {
        var cache    = getBaseCache();
        var cacheKey = 'testkey';
        var value    = 'myvalue';

        cache.put(cacheKey, value, 10);

        var cacheEntry = cache.get(cacheKey);

        expect(cacheEntry.getCachedValue()).toEqual(value);
    });

    it('should return null if cache key does not exist', function() {

        var cacheEntry = getBaseCache().get('NotExisTingCacHeKey0815');

        expect(cacheEntry).toEqual(null);
    });
});

describe('baseCache model', function() {

    it('should be able to return its key', function() {
        var cacheKey = 'myTestKey';

        var model = getCacheModel({key: cacheKey, value: {}, expireTimestamp: 555});

        expect(model.getKey()).toEqual(cacheKey);
    });

    it('should be able to cache objects', function() {
        var value = {test: true, foo: 'bar'};

        var model = getCacheModel({key: 'myTestKey', value: value, expireTimestamp: getCurrentTimestamp()});

        var expected = serializeObjectForComparison(model.getCachedValue());
        var shouldBe = serializeObjectForComparison(value);

        expect(expected).toEqual(shouldBe);
    });

    it('should be expired if timeout is in the past', function() {

        var model = getCacheModel({key: 'testExpired', value: {}, expireTimestamp: getCurrentTimestamp() - 15});

        expect(model.isExpired()).toEqual(true);
    });

    it('should not be expired if timeout is in the future', function() {

        var model = getCacheModel({key: 'testNotExpired', value: {}, expireTimestamp: getCurrentTimestamp() + 15});

        expect(model.isExpired()).toEqual(false);
    });
});