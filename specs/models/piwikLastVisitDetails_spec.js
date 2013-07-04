/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

(function () {

var Alloy = require('alloy');
var filterLimit = Alloy.CFG.piwik.filterLimit;
var initialVisitorsToLoad = 15;

function getFixtures()
{
    return require('specs/fixtures/piwikLastVisitDetails');
}

function getLast10Visitors()
{
    return getFixtures().getLast10Visitors();
}

function getValidAccount()
{
    return require('specs/utils/account').getValidAccount();
}

function loadFixture(collection, fixture)
{
    var parsedData = collection.parse(fixture, {});

    collection.reset(parsedData, {});
}

function expectOffset(collection, currentOffset, nextOffset)
{
    expect(collection.currentOffset).toEqual(currentOffset);
    expect(collection.nextOffset).toEqual(nextOffset);
}

describe('piwikLastVisitDetails Collection', function() {
    var lastVisitors = null;

    beforeEach(function() {
        lastVisitors = Alloy.createCollection('piwikLastVisitDetails');
    });

    it('should load all visitor details into collection', function() {

        loadFixture(lastVisitors, getLast10Visitors());

        expect(lastVisitors.length).toEqual(10);
    });

    it('should fetch first 15 visitors initially', function() {
        lastVisitors.initial(getValidAccount(), 3, 'day', 'today');

        expectOffset(lastVisitors, 0, initialVisitorsToLoad);
    });

    it('should be able to load previous visitors', function() {
        lastVisitors.initial(getValidAccount(), 3, 'day', 'today');
        lastVisitors.previous(getValidAccount(), 3);

        expectOffset(lastVisitors, initialVisitorsToLoad, initialVisitorsToLoad + filterLimit);
    });

    it('should be able to load next visitors', function() {
        lastVisitors.initial(getValidAccount(), 3, 'day', 'today');
        lastVisitors.previous(getValidAccount(), 3);
        lastVisitors.next(getValidAccount(), 3);

        expectOffset(lastVisitors, 0, initialVisitorsToLoad);
    });

    it('should load the first visitors again if we are already at the beginning', function() {
        lastVisitors.initial(getValidAccount(), 3, 'day', 'today');
        lastVisitors.next(getValidAccount(), 3);

        expectOffset(lastVisitors, 0, initialVisitorsToLoad);
    });

    it('should be able to navigate forward and backward', function() {
        lastVisitors.initial(getValidAccount(), 3, 'day', 'today');
        expectOffset(lastVisitors, 0, initialVisitorsToLoad);

        lastVisitors.previous(getValidAccount(), 3);
        expectOffset(lastVisitors, initialVisitorsToLoad, initialVisitorsToLoad + filterLimit);

        lastVisitors.previous(getValidAccount(), 3);
        expectOffset(lastVisitors, initialVisitorsToLoad + filterLimit, initialVisitorsToLoad + (filterLimit * 2));

        lastVisitors.next(getValidAccount(), 3);
        expectOffset(lastVisitors, initialVisitorsToLoad, initialVisitorsToLoad + filterLimit);

        lastVisitors.previous(getValidAccount(), 3);
        expectOffset(lastVisitors, initialVisitorsToLoad + filterLimit, initialVisitorsToLoad + (filterLimit * 2));

        lastVisitors.next(getValidAccount(), 3);
        expectOffset(lastVisitors, initialVisitorsToLoad, initialVisitorsToLoad + filterLimit);

        lastVisitors.next(getValidAccount(), 3);
        expectOffset(lastVisitors, 0, initialVisitorsToLoad);
    });

    it('should convert period to month if period is range', function() {
        lastVisitors.initial(getValidAccount(), 3, 'range', 'today');

        expect(lastVisitors.getPeriod()).toEqual('month');
    });

    it('should only use the first date if date is a range date', function() {
        lastVisitors.initial(getValidAccount(), 3, 'range', '2012-02-02,2013-03-03');

        expect(lastVisitors.parseDate()).toEqual('2012-02-02');
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(lastVisitors.validResponse([{}])).toBeTruthy();
        expect(lastVisitors.validResponse([])).toBeTruthy();
        expect(lastVisitors.validResponse({})).toBeFalsy();
        expect(lastVisitors.validResponse(null)).toBeFalsy();
    });

});


})();