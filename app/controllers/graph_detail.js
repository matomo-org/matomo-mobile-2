/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var args = arguments[0] || {};

var reportName = args.reportName || ' ';
var reportDate = args.reportDate || ' ';
var isTablet = require('alloy').isTablet;

$.graph = $.graphWidget.getView();

var graphSwitcher = Alloy.createController('graph_switcher', args);
graphSwitcher.addSwitchGraph(true);
$.index.add(graphSwitcher.getView());

graphSwitcher.on('close', close);

graphSwitcher.on('switch', function () {
    var url = getGraphUrlWithSize(getPictureWidth(), getPictureHeight());
    $.graphWidget.loadImage(url);
});

$.index.addEventListener('click', function () {
    if (!graphSwitcher) {
        return;
    }
    
    graphSwitcher.toggleVisibility();
});

/**
 * Gets the width of the window.
 * 
 * @returns {int} The width in px 
 */
function getViewWidth() {
    if ($.index && $.index.size && $.index.size.width) {
        return $.index.size.width;
    }

    return Ti.Platform.displayCaps.platformWidth;
}

/**
 * Gets the height of the window.
 * 
 * @returns {int} The height in px 
 */
function getViewHeight() {
    if ($.index && $.index.size && $.index.size.height) {
        return $.index.size.height;
    }

    return Ti.Platform.displayCaps.platformHeight;
}

/**
 * Gets the calculated width of the graph.
 * 
 * @returns {int} The width in px 
 */
function getPictureWidth() {
    return getViewWidth() - 20; // 10px space top and bottom
}

/**
 * Gets the calculated height of the graph.
 * 
 * @returns {int} The height in px 
 */
function getPictureHeight() {
    var height        = getViewHeight();
    var pictureHeight = 0;
    
    if (isTablet) {
        pictureHeight = height -  Math.floor(height / 4) - 20; // 75% - 20px (10px space top and bottom)
    } else {
        pictureHeight = height - 20; // 10px space left and right
    }
    
    return pictureHeight;
}

var navBarHeight = Ti.Platform.displayCaps.platformHeight - getViewHeight();

/**
 * Gets the calculated width of the graph after a window orientation change on Android. We have to detect 
 * current width/height cause 'this.size' is not correct after an orientation change.
 * 
 * @returns {int} The width in px 
 */
function getOrientationSpecificWidth() {
    var pictureWidth = Ti.Platform.displayCaps.platformWidth - navBarHeight - 50;
    
    return pictureWidth;
}

/**
 * Gets the calculated height of the graph after a window orientation change on Android. We have to detect 
 * current width/height cause 'this.size' is not correct after an orientation change.
 * 
 * @returns {int} The height in px 
 */
function getOrientationSpecificHeight() {
    var pictureHeight = Ti.Platform.displayCaps.platformHeight - navBarHeight - 50;
    
    return pictureHeight;
}

/**
 * Gets the graph url for the given width and height.
 * 
 * @returns {string}  The url to request the graph.
 */
function getGraphUrlWithSize(width, height) {

    if (!graphSwitcher.currentGraphUrl()) {
        
        return '';
    }

    var graph            = require('Piwik/PiwikGraph');
    var graphUrlWithSize = graph.appendSize(graphSwitcher.currentGraphUrl(), width, height, true);

    var params = {showMetricTitle: 1, showLegend: 1, legendAppendMetric: 1};
    if (isTablet) {
        params.backgroundColor = 'ffffff';
    }

    graphUrlWithSize = graph.setParams(graphUrlWithSize, params);
    graph = null;
    
    return graphUrlWithSize;
}

/**
 * Gets the image view for the given url, width and height.
 * 
 * @returns {Ti.UI.ImageView}  The created ImageView instance.
 */
function getImageView(url, width, height) {

    console.debug('matomo graphUrl is ' + url, 'graphdetail::getImageView');

    var options = {width: width,
                   height: height,
                   touchEnabled: false,
                   canScale: !OS_ANDROID,
                   hires: !OS_ANDROID,
                   defaultImage: '/images/graphDefault.png',
                   enableZoomControls: false,
                   image: url};

    return Alloy.createWidget('org.piwik.imageview', 'widget', options);
}

var pictureWidth     = getPictureWidth();
var pictureHeight    = getPictureHeight();
var graphUrlWithSize = getGraphUrlWithSize(pictureWidth, pictureHeight);

$.graphWidget.loadImage(graphUrlWithSize);

if (isTablet) {

    var quarter = Math.floor(getViewHeight() / 4);
    $.topContainer.height = quarter;
    $.bottomContainer.top = quarter;

    if (args.reportName) {
        $.reportName.text = '' + reportName;
    }
    
    if (args.reportDate) {
        $.reportDate.text = '' + reportDate;
    }

} else {

    function rotateImageOnAndroid (event) {

        try {
            var pictureWidth  = getOrientationSpecificWidth();
            var pictureHeight = getOrientationSpecificHeight();
            
            $.index.remove($.graph);
            $.graph = null;

            if ($.graphWidget) {
                $.graphWidget.destroy();
                $.graphWidget = null;
            }

            var graphUrlWithSize = getGraphUrlWithSize(pictureWidth, pictureHeight);
            $.graphWidget        = getImageView(graphUrlWithSize, pictureWidth, pictureHeight);
            $.graph              = $.graphWidget.getView();

            $.graphWidget.setParent($.index);

        } catch (e) {
            console.warn('Failed to update (remove and add) graph', 'graphdetail');
            console.warn(e, 'graphdetail');
        }
    }
    
    function rotateImage () {

        var pictureWidth  = getPictureWidth();
        var pictureHeight = getPictureHeight();
        var url = getGraphUrlWithSize(pictureWidth, pictureHeight);

        $.graphWidget.setWidth(pictureWidth);
        $.graphWidget.setHeight(pictureHeight);
        $.graphWidget.loadImage(url);
    }

    Ti.Gesture.addEventListener('orientationchange', OS_ANDROID ? rotateImageOnAndroid : rotateImage);
}

function trackWindowRequest()
{
    require('Piwik/Tracker').setCustomVariable(1, 'reportName', reportName, 'page');

    require('Piwik/Tracker').trackWindow('Graph Detail', 'graph/detail');
}

function onOpen()
{
    trackWindowRequest();
}

function destroy()
{
    if (!isTablet) {
        Ti.Gesture.removeEventListener('orientationchange', OS_ANDROID ? rotateImageOnAndroid : rotateImage);
    }
}

function close()
{
    if (OS_ANDROID) {
        require('layout').close($.index);
    } else {
        $.index.close();
    }
}

function open()
{
    if (OS_ANDROID) {
        require('layout').open($.index);
        if (isTablet) {
            $.index.left = 0;
        }
    } else {
        $.index.open();
    }
}

exports.open = open;