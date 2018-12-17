/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};

var staticUrl    = args.imageGraphUrl || '';
var evolutionUrl = args.imageGraphEvolutionUrl || '';
var currentUrl   = getPreferredGraphUrl();

function getSettings()
{
    return Alloy.createCollection('AppSettings').settings();
}

/**
 * Switches/Changes the pointer to the next graph url and returns the url. Example: If static graph is currently active
 * it'll switch to the evolution graph and return the url of the evolution graph. Automatically stores the chosen
 * preference in the user settings.
 *
 * @returns  {string}  The switched graph url. Either a static or an evolution graph url.
 */
function nextGraphUrl() 
{
    if (currentUrl == staticUrl) {
        currentUrl = evolutionUrl;
        
        getSettings().setPreferEvolutionGraphs(true);
        require('Piwik/Tracker').trackEvent({name: 'Switch Graph Evolution', category: 'Graph Switcher'});
        
    } else if (currentUrl == evolutionUrl) {
        currentUrl = staticUrl;
        
        getSettings().setPreferEvolutionGraphs(false);
        require('Piwik/Tracker').trackEvent({name: 'Switch Graph Static', category: 'Graph Switcher'});
    }
    
    return currentUrl;
}

/**
 * Gets the name of the graph type that is currently not active. This is either "Evolution Graph" or "Static Graph".
 * Example: If static graph is currently active, you'll get "Evolution Graph". Can be used to display the name of the
 * graph type in a button.
 *
 * @returns  {string}  The name of the graph type that is currently not active.
 */
function getNextGraphType() 
{
    if (currentUrl == evolutionUrl) {
        return L('Mobile_StaticGraph');
    }
    
    return L('Mobile_EvolutionGraph');
}

/**
 * Gets the preferred graph url. This will be either a static or an evolution graph url. If only one url is set, that
 * url will be returned. If both urls are set, the preferred graph url is chosen depending on the user setting.
 *
 * @returns  {string}  The url of the preferred graph.
 */
function getPreferredGraphUrl() 
{
    if (!evolutionUrl && staticUrl) {
        return staticUrl;
        
    } else if (!staticUrl && evolutionUrl) {
        return evolutionUrl;
        
    } else if (!staticUrl && !evolutionUrl) {
        return '';
    } 
    
    if (getSettings().preferEvolutionGraphs()) {
        
        return evolutionUrl;
    }
    
    return staticUrl;
}

function doSwitchGraph()
{
    // event to switch between normal and evolution graph
    $.trigger('switch', {graphUrl: nextGraphUrl()});
    
    $.switchButton.title = getNextGraphType();
}

function doClose()
{
    $.trigger('close', {});
}

/**
 * Detects whether at least two different graph urls are set.
 *
 * @returns  {boolean}  true if the user can switch between multiple graphs, false otherwise.
 */
function canSwitch() 
{
    if (staticUrl == evolutionUrl) {
        // this happens for example in "Visits Summary" report
        
        return false;
    }

    return staticUrl && evolutionUrl;
}

exports.canSwitch = canSwitch; 

/**
 * Gets the current active graph url.
 *
 * @returns  {string}  The currently active graph url. Either a static or an evolution graph url.
 */
exports.currentGraphUrl = function() 
{
    return currentUrl;
};

/**
 * Toggles the visibility of the toolbar. If toolbar is currently hidden, it'll be displayed afterwards. If toolbar is
 * currently displayed, it'll be hidden afterwards.
 */
exports.toggleVisibility = function() 
{
    if ($.index && $.index.visible) {
        $.index.hide();
    } else if ($.index && !$.index.visible) {
        $.index.show();
    }
};

/**
 * Fades the switch graph view out.
 */
exports.fadeOut = function() 
{
    $.index.animate({opacity: 0, delay: 600, duration: 600}, function () {

        $.index.hide();
        $.index.opacity = OS_ANDROID ? 0.9 : 0.7;
    });
};

/**
 * Adds a simple toolbar to the given window/view containing a button which allows to switch between graphs and a button
 * to close the window. The button to switch between graphs will be only added if there are at least two different 
 * graph urls.
 *
 * @param  {Piwik.UI.Window|Ti.UI.View}  win         The toolbar will be rendered into this view or window.
 * @param  {boolean}                     showCloseButton  Whether a close button should be displayed or not. On Android
 *                                                        a close button will not be displayed as there is a hardware
 *                                                        key for that.
 * 
 * @fires  Piwik.UI.SwitchGraph#event:switch
 * @fires  Piwik.UI.SwitchGraph#event:close
 */
exports.addSwitchGraph = function(showCloseButton) 
{
    if (OS_ANDROID) {

        if (!canSwitch()) {
            $.index.height  = 0;
            $.index.visible = false;
            $.index.hide();
            
            return;
        }

        $.switchButton.title = getNextGraphType();
        
       return;
    } 

    var items = $.index.items;
    
    if (!showCloseButton) {
        items.shift();
    }

    if (canSwitch()) {
        $.switchButton.title = getNextGraphType();
    } else {
        items.pop();
    }

    $.index.items = items;
};