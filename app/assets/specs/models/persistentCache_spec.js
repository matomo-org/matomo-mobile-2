/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

require('behave').andSetup(this);

function getPersistentCache()
{
    var Alloy = require('alloy');
    var cache = Alloy.createCollection('persistentCache');

    return cache;
}

function expectNumberOfEntriesToBeInCache(cache, numEntries)
{
    expect(cache.length).toBe(numEntries);
}

describe('persistentCache models', function() {

    it('should have no cache entries by default', function() {
        var cache = getPersistentCache();
        cache.fetch();

        expectNumberOfEntriesToBeInCache(cache, 0);
    });

    it('should have one cache entry after putting a value', function() {
        var cache = getPersistentCache();

        cache.put('testkey', 'myvalue', 10);

        expectNumberOfEntriesToBeInCache(cache, 1);
    });
});