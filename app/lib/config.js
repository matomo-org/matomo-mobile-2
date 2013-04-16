/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class   The config defines configuration data within the application. 
 *
 * @static
 */
var config = {};

/**
 * Enable or disable logging. Should be disabled in a production release. Will be automatically disabled when
 * preparing a build by the 'tools/preparerelease.sh' script. This makes the app a bit more faster.
 *
 * @define {boolean}
 * c
 * @type boolean
 */
config.logEnabled     = false;

/**
 * Enable or disable profiling. Should be disabled in a production release. Will be automatically disabled when
 * preparing a build by the 'tools/preparerelease.sh' script. This makes the app a bit more faster.
 * 
 * @define {boolean}
 * c
 * @type boolean
 */
config.profileEnabled = false;

/**
 * True if debugging is enabled, false otherwise. Has to be disabled in a production release. If enabled it logs more
 * errors and does not cache already included files.
 *
 * @define {boolean}
 * c
 * @type boolean
 */
config.debugging      = false;

/**
 * Piwik related settings.
 *
 * @type Object
 */
config.piwik = {
    timeout: 60000,
    preferredMetrics: ['nb_hits', 'nb_visits', 'nb_pageviews', 'nb_uniq_pageviews', 'nb_actions', 'nb_conversions', 'revenue'],
    defaultReportDate: 'day##yesterday',
    filterLimit: 30,
    multiChartEnabled: false,
    defaultLocale: 'en',
    latestServerVersion: '1.9.2',
    graphsEnabled: true,
    preferEvolutionGraphs: false,
    trackingEnabled: false,
    numDisplayedWebsites: 50,
    graph: {
          fontSize: 9,
          showMetricTitle: 0,
          aliasedGraph: 1,
          legendAppendMetric: 0
    }
};

config.faqUrl = 'http://piwik.org/mobile/faq';

/**
 * Apple app store related.
 *
 * @type Object
 */
config.appleAppStore = {
    appId: '385536442'
};

/**
 * Tracking related settings.
 *
 * @type Object
 */
config.tracking = {
    enabled: true,
    siteId: 25,
    apiVersion: 1,
    baseUrl: 'http://mobileapp.piwik.org',
    piwikServerUrl: 'http://demo.piwik.org/piwik.php',
    /**
     * Set to 0 for unlimited tracks
     */
    maxTracksPerDay: 200
};

module.exports = config;
