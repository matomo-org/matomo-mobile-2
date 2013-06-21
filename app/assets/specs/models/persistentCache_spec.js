/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

require('behave').andSetup(this);

describe('persistentCache models', function() {

    it('should have no cache entries by default', function(){
        var Alloy = require('alloy');
        var cache = Alloy.createCollection('persistentCache');
        cache.fetch();

        expect(cache.length).toBe(0);
    });

});