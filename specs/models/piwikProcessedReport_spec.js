/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

(function () {

var Alloy = require('alloy');

function getFixtures()
{
    return require('specs/fixtures/piwikProcessedReport');
}

function getSearchEngineReport()
{
    return getFixtures().getSearchEngineReport();
}

function getSearchEngineEntry()
{
    return getFixtures().getSearchEngineEntry();
}

function getVisitsOfDayByWeekEntry()
{
    return getFixtures().getVisitsOfDayByWeekEntry();
}

function getReportWithDimensionHavingNoEntries()
{
    return getFixtures().getReportWithDimensionHavingNoEntries();
}

function getReportWithDimensionHavingNoSubtableAndNoGraphs()
{
    return getFixtures().getReportVisitsOfDayByWeek();
}

function getBrowserFamilyReport()
{
    return getFixtures().getBrowserFamilyReport();
}

function getReportHavingNoDimension()
{
    return getFixtures().getVisitsSummaryReport();
}

function loadFixture(collection, fixture)
{
    collection.setSortOrder('nb_visits');

    var parsedData = collection.parse(fixture, {});

    collection.reset(parsedData, {});
}

describe('piwikProcessedReport Collection', function() {
    var reportCollection = null;

    beforeEach(function() {
        reportCollection = Alloy.createCollection('piwikProcessedReport');
    });

    it('should not have a sort order by default', function() {

        expect(reportCollection.getSortOrder()).toEqual(null);
    });

    it('should be able to set and get the sort order', function() {

        reportCollection.setSortOrder('nb_visits');

        expect(reportCollection.getSortOrder()).toEqual('nb_visits');
    });

    it('should return the correct number of available reports', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getNumberOfReports()).toEqual(5);
    });

    it('should return zero if the report has no data', function() {

        loadFixture(reportCollection, getReportWithDimensionHavingNoEntries());

        expect(reportCollection.getNumberOfReports()).toEqual(0);
    });

    it('should return the correct number of available reports when report has no dimension', function() {

        loadFixture(reportCollection, getReportHavingNoDimension());

        expect(reportCollection.getNumberOfReports()).toEqual(7);
    });

    it('should be able to recognize the report has reports if there are report data', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.hasReports()).toBeTruthy();
    });

    it('should be able to recognize the report has no reports if there is no report data', function() {

        loadFixture(reportCollection, getReportWithDimensionHavingNoEntries());

        expect(reportCollection.hasReports()).toBeFalsy();
    });

    it('should be able to recognize the report has reports if there are report data when report has no dimension', function() {

        loadFixture(reportCollection, getReportHavingNoDimension());

        expect(reportCollection.hasReports()).toBeTruthy();
    });

    it('should be able to recognize the report has sub tables', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.hasSubtable()).toBeTruthy();
    });

    it('should be able to recognize the report has no sub tables', function() {

        loadFixture(reportCollection, getReportWithDimensionHavingNoSubtableAndNoGraphs());

        expect(reportCollection.hasSubtable()).toBeFalsy();
    });

    it('should be able to return the action to load sub tables', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getActionToLoadSubTables()).toEqual('getKeywordsFromSearchEngineId');
    });

    it('should return null if the report has no action to load sub tables', function() {

        loadFixture(reportCollection, getReportWithDimensionHavingNoSubtableAndNoGraphs());

        expect(reportCollection.getActionToLoadSubTables()).toEqual(null);
    });

    it('should be able to return the module of the report', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getModule()).toEqual('Referers');
    });

    it('should be able to return the module of the report when report has no dimension', function() {

        loadFixture(reportCollection, getReportHavingNoDimension());

        expect(reportCollection.getModule()).toEqual('VisitsSummary');
    });

    it('should be able to return the name of the metric', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getMetricName()).toEqual('Visits');
    });

    it('should be able to return the name of the metric when report has no dimension', function() {

        loadFixture(reportCollection, getReportHavingNoDimension());

        expect(reportCollection.getMetricName()).toEqual('Visits');
    });

    it('should be able to return the report date', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getReportDate()).toEqual('Monday 1 July 2013');
    });

    it('should be able to return the name of the report', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getReportName()).toEqual('Search Engines');
    });

    it('should be able to return the static and evolution graph url', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getImageGraphUrl()).toEqual('index.php?module=API&method=ImageGraph.get&idSite=3&apiModule=Referers&apiAction=getSearchEngines&token_auth=anonymous&period=day&date=yesterday');
        expect(reportCollection.getEvolutionImageGraphUrl()).toEqual('index.php?module=API&method=ImageGraph.get&idSite=3&apiModule=Referers&apiAction=getSearchEngines&token_auth=anonymous&period=day&date=2013-06-02,2013-07-01');
    });

    it('should return an empty string if there is no static or evolution graph url', function() {

        loadFixture(reportCollection, getReportWithDimensionHavingNoSubtableAndNoGraphs());

        expect(reportCollection.getImageGraphUrl()).toEqual('');
        expect(reportCollection.getEvolutionImageGraphUrl()).toEqual('');
    });

    it('should return the metadata of the report', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getMetadata()).toEqual(getSearchEngineReport().metadata);
    });

    it('should return the metrics of the report', function() {

        loadFixture(reportCollection, getSearchEngineReport());

        expect(reportCollection.getMetrics()).toEqual(getSearchEngineReport().columns);
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(reportCollection.validResponse(getSearchEngineReport())).toBeTruthy();
        expect(reportCollection.validResponse(null)).toBeFalsy();
    });

    it('should be able to detect whether the report has a dimension or not', function() {

        loadFixture(reportCollection, getSearchEngineReport());
        expect(reportCollection.hasDimension()).toBeTruthy();

        loadFixture(reportCollection, getReportHavingNoDimension());
        expect(reportCollection.hasDimension()).toBeFalsy();
    });
});


describe('piwikProcessedReport Model', function() {
    var searchEngineModel = null;
    var visitsOfDayModel  = null;

    beforeEach(function() {
        searchEngineModel = Alloy.createModel('piwikProcessedReport', getSearchEngineEntry());
        visitsOfDayModel  = Alloy.createModel('piwikProcessedReport', getVisitsOfDayByWeekEntry());
    });

    it('should return the title of a report entry', function() {

        expect(searchEngineModel.getTitle()).toEqual('Google');
    });

    it('should return the value of a report entry', function() {

        expect(searchEngineModel.getValue()).toEqual(16);
    });

    it('should return the sort order column of a report entry', function() {

        expect(searchEngineModel.getSortOrder()).toEqual('nb_visits');
    });

    it('should be able to recognize a report entry has a logo', function() {

        expect(searchEngineModel.hasLogo()).toBeTruthy();
        expect(visitsOfDayModel.hasLogo()).toBeFalsy();
    });

    it('should return the path to the logo of a report entry', function() {

        expect(searchEngineModel.getLogo()).toEqual('plugins\/Referers\/images\/searchEngines\/google.com.png');
        expect(visitsOfDayModel.getLogo()).toBeNull();
    });

    it('should be able to detect the width and height of the logo', function() {

        expect(searchEngineModel.getLogoWidth()).toEqual(14);
        expect(searchEngineModel.getLogoHeight()).toEqual(16);

        expect(visitsOfDayModel.getLogoWidth()).toBeNull();
        expect(visitsOfDayModel.getLogoHeight()).toBeNull();
    });

    it('should return the id of the sub table', function() {

        expect(searchEngineModel.getSubtableId()).toEqual(32);

        expect(visitsOfDayModel.getSubtableId()).toBeNull();
    });
});

describe('piwikProcessedReport CollectionToModel Interaction', function() {
    var reportCollection = null;

    beforeEach(function() {
        reportCollection = Alloy.createCollection('piwikProcessedReport');
    });

    it('should not have a sort order by default', function() {
        loadFixture(reportCollection, getSearchEngineReport());
        var model = reportCollection.first();

        expect(model.getTitle()).toEqual('Google');
        expect(model.getValue()).toEqual(16);
        expect(model.getSortOrder()).toEqual('nb_visits');
        expect(model.hasLogo()).toBeTruthy();
        expect(model.getLogo()).toEqual('plugins\/Referers\/images\/searchEngines\/google.com.png');
        expect(model.getLogoWidth()).toBeNull();
        expect(model.getLogoHeight()).toBeNull();
        expect(model.getSubtableId()).toEqual(32);
    });

    it('should always prefer the short label of a report entry', function() {

        loadFixture(reportCollection, getBrowserFamilyReport());

        expect(reportCollection.first().getTitle()).toEqual('Webkit');
    });

    it('should convert an empty value to a hyphen', function() {

        loadFixture(reportCollection, getBrowserFamilyReport());

        expect(reportCollection.first().getValue()).toEqual('-');
    });
});

})();