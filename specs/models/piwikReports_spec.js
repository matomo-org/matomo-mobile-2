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
    return require('specs/fixtures/piwikReports');
}

function getDashboards()
{
    return getFixtures().getDashboards();
}

function getReportMetadata()
{
    return getFixtures().getReportMetadata();
}

function getMobileVsDesktopReport()
{
    return getFixtures().getMobileVsDesktopReport();
}

function getVisitsSummaryReport()
{
    return getFixtures().getVisitsSummaryReport();
}

function getAGoalReport()
{
    return getFixtures().getAGoalReport();
}

function loadFixture(collection, fixture)
{
    var parsedData = collection.parse(fixture, {});

    collection.reset(parsedData, {});
}

describe('piwikReports Collection', function() {
    var reportCollection = null;

    beforeEach(function() {
        reportCollection = Alloy.createCollection('piwikReports');
    });

    it('should merge dashboards and report metadata if possible', function() {

        loadFixture(reportCollection, [getReportMetadata()]);
        expect(reportCollection.length).toEqual(53);

        loadFixture(reportCollection, [getReportMetadata(), getDashboards()]);
        expect(reportCollection.length).toEqual(59);
    });

    it('should detect the report has a dashboard if dahboards are given', function() {

        loadFixture(reportCollection, [getReportMetadata(), getDashboards()]);

        expect(reportCollection.hasDashboardReport()).toBeTruthy();
    });

    it('should detect the report has no dashboards if no dahboards are given', function() {

        loadFixture(reportCollection, [getReportMetadata()]);

        expect(reportCollection.hasDashboardReport()).toBeFalsy();
    });

    it('should be able to return the first report that is not a MultiSites report', function() {

        loadFixture(reportCollection, [getReportMetadata()]);

        var firstReport = reportCollection.getFirstReportThatIsNotMultiSites();

        expect(firstReport.getModule()).toEqual('VisitsSummary');
        expect(firstReport.getAction()).toEqual('get');
    });

    it('should be able to return the first report that is not a MultiSites report and should prefer a dashboard report', function() {

        loadFixture(reportCollection, [getReportMetadata(), getDashboards()]);

        var firstReport = reportCollection.getFirstReportThatIsNotMultiSites();

        expect(firstReport.getModule()).toEqual('VisitorInterest');
        expect(firstReport.getAction()).toEqual('getNumberOfVisitsPerVisitDuration');
    });

    it('should be able to return an entry report and prefer a report that is not a MultiSitesreport', function() {

        loadFixture(reportCollection, [getReportMetadata()]);

        var entryReport = reportCollection.getFirstReportThatIsNotMultiSites();

        expect(entryReport.getModule()).toEqual('VisitsSummary');
        expect(entryReport.getAction()).toEqual('get');
    });

    it('should be able to return an entry report and prefer a dashboard report', function() {

        loadFixture(reportCollection, [getReportMetadata(), getDashboards()]);

        var entryReport = reportCollection.getFirstReportThatIsNotMultiSites();

        expect(entryReport.getModule()).toEqual('VisitorInterest');
        expect(entryReport.getAction()).toEqual('getNumberOfVisitsPerVisitDuration');
    });

    it('should be able to find an existing report within the collection', function() {

        loadFixture(reportCollection, [getReportMetadata(), getDashboards()]);

        var existingReport = Alloy.createModel('piwikReports', {module: 'VisitorInterest', action: 'getNumberOfVisitsPerVisitDuration'});

        expect(reportCollection.containsAction(existingReport)).toBeTruthy();

        var notExistingReport = Alloy.createModel('piwikReports', {module: 'IAmNotExisTing', action: 'getSuperFancyReport'});
        expect(reportCollection.containsAction(notExistingReport)).toBeFalsy();
    });

    it('should be able to detect whether the collection contains a specific category', function() {
        loadFixture(reportCollection, [getReportMetadata(), getDashboards()]);

        expect(reportCollection.containsReportCategory('All Websites')).toBeTruthy();
        expect(reportCollection.containsReportCategory('Visits Summary')).toBeTruthy();
        expect(reportCollection.containsReportCategory('Visits Undefined')).toBeFalsy();
        expect(reportCollection.containsReportCategory('')).toBeFalsy();
        expect(reportCollection.containsReportCategory(null)).toBeFalsy();
    });

    it('should be able to detect whether response is a valid response', function() {
        expect(reportCollection.validResponse([{}])).toBeTruthy();
        expect(reportCollection.validResponse([{}, {}, {}])).toBeTruthy();
        expect(reportCollection.validResponse([])).toBeFalsy();
        expect(reportCollection.validResponse(null)).toBeFalsy();
    });
});


describe('piwikReports Model', function() {
    var mobileReport = null;
    var goalReport = null;
    var visitsSummaryReport = null;

    beforeEach(function() {
        goalReport = Alloy.createModel('piwikReports', getAGoalReport());
        mobileReport = Alloy.createModel('piwikReports', getMobileVsDesktopReport());
        visitsSummaryReport = Alloy.createModel('piwikReports', getVisitsSummaryReport());
    });

    it('should detect whether a report has a dimension or not', function() {
        expect(visitsSummaryReport.hasDimension()).toBeFalsy();
        expect(mobileReport.hasDimension()).toBeTruthy();
    });

    it('should prefer the most appropriate metric if no metric is given', function() {
        expect(visitsSummaryReport.getSortOrder()).toEqual('nb_visits');
    });

    it('should prefer the passed metric if is given', function() {
        expect(visitsSummaryReport.getSortOrder('nb_actions')).toEqual('nb_actions');
    });

    it('should be able to return the name of the used metric', function() {
        expect(visitsSummaryReport.getMetricName()).toEqual('Visits');
    });

    it('should be able to return the name of the report', function() {
        expect(mobileReport.getReportName()).toEqual('Mobile vs Desktop');
    });

    it('should be able to return the module of the report', function() {
        expect(mobileReport.getModule()).toEqual('UserSettings');
    });

    it('should be able to return the action of the report', function() {
        expect(mobileReport.getAction()).toEqual('getMobileVsDesktop');
    });

    it('should be able to return the uniqueId of the report', function() {
        expect(mobileReport.getUniqueId()).toEqual('UserSettings_getMobileVsDesktop');
    });

    it('should be able to return all available metrics', function() {
        expect(mobileReport.getMetrics()).toEqual(getMobileVsDesktopReport().metrics);
    });

    it('should be able to detect whether a report has parameters', function() {

        expect(goalReport.hasParameters()).toBeTruthy();
        expect(mobileReport.hasParameters()).toBeFalsy();
    });

    it('should be able to detect whether a report has parameters', function() {
        expect(goalReport.hasParameters()).toBeTruthy();
        expect(mobileReport.hasParameters()).toBeFalsy();
    });

    it('should be able to return the parameters of a report', function() {
        expect(goalReport.getParameters()).toEqual({idGoal: '4'});
    });

});


})();