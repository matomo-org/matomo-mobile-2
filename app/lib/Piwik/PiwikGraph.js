/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik   = require('library/Piwik');
 
/**
 * @class    This graph object provides some useful methods to assemble Piwik graph urls which can be displayed using a
 *           Titanium.UI.ImageView. To accomplish this, it prepares and finalizes the graph url defined by the metadata.
 *
 * Valid URL Parameters
 *  idSite: piwik
 *  period: piwik
 *  date: piwik
 *  apiModule: which API-Module should be requested (e.g. UserCountry)
 *  apiAction: which API-Function should be called (e.g. getCountry)
 *  graphType: {evolution | verticalBar | pie | 3dPie} (default: evolution)
 *  outputType: {0(return direct) | 1(return temp filename)} (default: 0)
 *  column: which metric of report should be drawn (default: "nb_visits")
 *  width: width of the img (default: 1044)
 *  height: height of the img (default: 290)
 *  fontSize: fontSize of any text (default: 9)
 *  colors: A comma separated list of colors: 
 *      color of the lines in an evolution-chart 
 *      color for the filled bars in verticalBar-chart 
 *      color for the bar-surrounding rectangles in verticalBar-chart 
 *      color for the first pie-value 
 *      color for the second pie-value 
 *      color for the third pie-value
 *      color for the fourth pie-value
 *      color for the fifth pie-value
 *      color for the lines separating the pie-values
 *
 * @exports  PiwikGraph as Piwik.PiwikGraph
 * @static
 */
function PiwikGraph () {

    /**
     * The locale.
     *
     * @type  string
     * 
     * @private
     */
    var locale = Piwik.require('Locale').getLocale();
    
    /**
     * Appends the size string to a given graphUrl. This defines how height the chart will be rendered. 
     *
     * @param    {string}  graphUrl  A Piwik graph url.
     * @param    {Object}  account   The piwik account that will be used to request the graph. 
     *                               The account contains the piwik accessUrl as well as the authToken.
     * @param    {Object}  site      The current selected website. 
     *
     * @returns  {string}  Url to the graph including the needed size information.
     */
    this.generateUrl = function (graphUrl, account, site) {
        
        if (!graphUrl) {
            
            return '';
        }
        
        var parameter   = {token_auth: account.tokenAuth,
                           idSite:     site.idsite,
                           language:   locale};

        var requestUrl  = '';
        for (var paramName in parameter) {
            requestUrl += paramName + '=' + parameter[paramName] + '&';
        }
        
        graphUrl = graphUrl + '&' + Piwik.getNetwork().encodeUrlParams(requestUrl);
        graphUrl = Piwik.getNetwork().getBasePath('' + account.accessUrl) + graphUrl;
        
        account  = null;
        site     = null;
        
        return graphUrl;
    };
    
    /**
     * Adds the current selected sort order to the given graph url.
     * 
     * @param    {string}  graphUrl   A Piwik graph url.
     * @param    {string}  sortORder  The sort order that should be used, for example 'actions' or 'visits'
     *
     * @returns  {string}  The updated Piwik graph url which will include the sort order
     */
    this.addSortOrder = function (graphUrl, sortOrder) {
        
        if (!sortOrder) {
            
            return graphUrl;
        }
        
        var sortOrderParams = {filter_sort_column: sortOrder, 
                               column: sortOrder,   // column = Piwik 1.8 and older
                               columns: sortOrder}; // columns = Piwik 1.9 and newer
                               
        return this.setParams(graphUrl, sortOrderParams);
    };
    
    /**
     * Adds one or multiple url params to the given graph url.
     * 
     * @param    {string}  graphUrl  A Piwik graph url.
     * @param    {Object}  params    An object containing key/value pairs.
     *
     * @returns  {string}  The updated Piwik graph url which now includes the given parameters
     */
    this.setParams = function (graphUrl, params) {
        
        if (!graphUrl) {
            
            return '';
        }
        
        var urlGetParams      = '';
        for (var paramName in params) {
            if (urlGetParams) {
                urlGetParams += '&';
            }
            
            urlGetParams     += paramName + '=' + params[paramName];
        }
        // urlGetParams is for example 'a=b&c=d&e=f'
        
        var separator = '&';
        var lastChar  = graphUrl.substr(graphUrl.length -1, 1);
        
        if ('&' == lastChar) {
            separator = '';
        }
        
        graphUrl      = graphUrl + separator + Piwik.getNetwork().encodeUrlParams(urlGetParams);
        params        = null;
        
        return graphUrl;
    };

    /**
     * Appends the size string and more styling parameter to the given graphUrl. 
     * This defines how height the chart will be rendered. 
     *
     * @param    {string}      graphUrl  A Piwik graph url.
     * @param    {string|Int}  width     The width of the chart in pixel.
     * @param    {string|Int}  height    The height of the chart in pixel.
     * @param    {boolean}     hires     Whether the graph shall be generated for a hires device (iOS). In such a case
     *                                   it renders the graph twice as high.
     *
     * @returns  {string}      Url to the graph including the needed size and styling information.
     */
    this.appendSize = function (graphUrl, width, height, hires) {

        var parameter = {width: width, height: height};
        var config    = require('config');
        
        for (var index in config.piwik.graph) {
            parameter[index] = config.piwik.graph[index];
        }
        
        if (hires && Piwik.getPlatform().isIos) {
            parameter.legendFontSize = parameter.fontSize * 2;
            parameter.fontSize = parameter.fontSize * 2;
            parameter.width    = parameter.width * 2;
            parameter.height   = parameter.height * 2;
        } else if (hires && Piwik.getPlatform().isAndroid) {
            parameter.legendFontSize = Math.round(parameter.fontSize * 1.5);
            parameter.fontSize = Math.round(parameter.fontSize * 1.5);
        } 
        
        // prevents graph from caching
        parameter.cacherand    = Math.floor(Math.random() * 9999999);
        
        graphUrl  = this.setParams(graphUrl, parameter);
        parameter = null;
        
        return graphUrl;
    };
    
    /**
     * Exceptionally, the piwik api can be used to display sparklines. It automatically displays sparklines of the
     * last30 days from now on.
     *
     * @param    {Int}     siteId     The id of a piwik site.
     * @param    {string}  accessUrl  The access URL of a piwik site.
     * @param    {string}  tokenAuth  The regarding auth_token of a piwik site.
     *
     * @returns  {string}  The generated url to display a sparkline url.
     */
    this.getSparklineUrl = function (siteId, accessUrl, tokenAuth) {

        var url = '?module=MultiSites&action=getEvolutionGraph&period=day&date=last30&evolutionBy=visits';
        url    += '&columns[]=nb_visits&idSite=' + siteId + '&idsite=' + siteId + '&viewDataTable=sparkline';
        url    += '&token_auth=' + tokenAuth;
        url    += "&width=200&height=50";

        // prevents graph from caching
        url    += '&cacherand=' + Math.floor(Math.random() * 9999999);

        return accessUrl + Piwik.getNetwork().encodeUrlParams(url);
    };
}

module.exports = new PiwikGraph();