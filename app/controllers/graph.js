/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var imageGraphUrl;
var imageGraphEvolutionUrl;
var reportName = '';
var reportDate = '';

var currentGraphUrlToDislay = '';

var graphSwitcher = null;

$.image.getView().addEventListener('click', function () {
    toggleDetailIcon();

    if (graphSwitcher) {
        graphSwitcher.toggleVisibility();
    }
});

if (!OS_MOBILEWEB) {
    // we need to wait till view is visible otherwise animation will never be executed.
    // load event is not supported on MobileWeb
    $.image.getView().addEventListener('load', function () {
        animateFadeOutDetailIcon();

        if (graphSwitcher) {
            graphSwitcher.fadeOut();
        }
    });
}

function width(image)
{
    return require('ui/helper').getWidth(image);
}

function height(image)
{
    return require('ui/helper').getHeight(image);
}

function getGraphOptions()
{
    return {imageGraphUrl: imageGraphUrl,
            imageGraphEvolutionUrl: imageGraphEvolutionUrl,
            reportName: reportName, 
            reportDate: reportDate};
}

function showDetail ()
{
    var detailGraph = Alloy.createController('graph_detail', getGraphOptions());
    detailGraph.open();
}

function updateImage(graphUrl)
{
    var graph = require('Piwik/PiwikGraph');
    var imageWithSize = graph.appendSize(graphUrl, $.image.getWidth(), $.image.getHeight(), true);
    
    console.debug('imageUrlWithSize', imageWithSize);

    if (!imageWithSize || !require('ui/helper').isTitaniumCompatibleImageUrl(imageWithSize)) {
        return;
    }

    if ($.image.getView()) {
        $.image.loadImage(imageWithSize);
    }
}

function addGraphSwitcher(switcher)
{
    if (graphSwitcher) {
        // prevent from adding graph switcher twice
        $.index.remove(graphSwitcher.getView());
    }

    switcher.addSwitchGraph(false);
    $.index.add(switcher.getView());
    graphSwitcher = switcher;

    graphSwitcher.on('switch', function (event) {
        if (!event || !event.graphUrl) {
            return;
        }
        
        updateImage(event.graphUrl);
        
        graphSwitcher.toggleVisibility();
        $.showDetailIcon.hide();
    });

    if (OS_MOBILEWEB) {
        graphSwitcher.fadeOut();
    }
}

function completeGraphUrl(graphUrl, processedReportCollection, accountModel)
{
    if (!graphUrl) {
        return '';
    }

    var graph = require('Piwik/PiwikGraph');
    graphUrl  = graph.addSortOrder(graphUrl, processedReportCollection.getSortOrder());
    graphUrl  = graph.generateUrl(graphUrl, accountModel);

    return graphUrl;
}

function addAdditionalParametersToGraphUrl(graphUrl, additionalParams)
{
    if (!additionalParams) {
        return graphUrl;
    }

    if (!graphUrl) {
        return '';
    }

    var graph = require('Piwik/PiwikGraph');
    graphUrl  = graph.setParams(graphUrl, additionalParams);

    return graphUrl;
}

function toggleDetailIcon()
{
    if ($.showDetailIcon && $.showDetailIcon.visible) {
        $.showDetailIcon.hide();
    } else if ($.showDetailIcon && !$.showDetailIcon.visible) {
        $.showDetailIcon.show();
    }
}

function hideDetailIcon()
{
    if (!$.showDetailIcon) {
        return;
    }
    
    $.showDetailIcon.hide();
    $.showDetailIcon.opacity = 1;
}

function animateFadeOutDetailIcon()
{
    if (!$.showDetailIcon) {
        return;
    }

    $.showDetailIcon.animate({opacity: 0, delay: 600, duration: 600}, hideDetailIcon);
}

function areGraphsEnabled()
{
    var settings = Alloy.createCollection('AppSettings').settings();

    return settings.areGraphsEnabled();
}

function hide()
{
    $.index.height = 0;
    $.index.hide();
    $.destroy();
    $.off();
}

exports.hide = hide;

function renderIfPossibleAndNeeded()
{
    if (!currentGraphUrlToDislay || !$.image.getWidth()) {
        return;
    }

    if (!$.image) {
        return;
    }

    $.image.off('postlayout', renderIfPossibleAndNeeded);

    updateImage(currentGraphUrlToDislay);

    if (OS_MOBILEWEB) {
        hideDetailIcon();
    }
}

exports.update = function (processedReportCollection, accountModel, additonalParams)
{
    if (!areGraphsEnabled()) {
        hide();
        // TODO remove from parent?
        return;
    }

    if (!processedReportCollection || !accountModel) {
        console.log('Cannot update graph, missing parameters');
        return;
    }

    imageGraphUrl = processedReportCollection.getImageGraphUrl();
    reportName    = processedReportCollection.getReportName();
    reportDate    = processedReportCollection.getReportDate();
    imageGraphEvolutionUrl = processedReportCollection.getEvolutionImageGraphUrl();

    imageGraphUrl = addAdditionalParametersToGraphUrl(imageGraphUrl, additonalParams);
    imageGraphEvolutionUrl = addAdditionalParametersToGraphUrl(imageGraphEvolutionUrl, additonalParams);
    imageGraphUrl = completeGraphUrl(imageGraphUrl, processedReportCollection, accountModel);
    imageGraphEvolutionUrl = completeGraphUrl(imageGraphEvolutionUrl, processedReportCollection, accountModel);

    var graphSwitcher = Alloy.createController('graph_switcher', getGraphOptions());

    if (!graphSwitcher.currentGraphUrl()) {
        // no image to display

        $.index.hide();
        return;
    }

    $.index.show();

    if (graphSwitcher.canSwitch()) {
        addGraphSwitcher(graphSwitcher);
    }

    currentGraphUrlToDislay = graphSwitcher.currentGraphUrl();
    renderIfPossibleAndNeeded();
};