exports.execute = function (link)
{
    if (!link) {
        
        return;
    }
    
    try {
        var tracker = require('Piwik/Tracker');
        tracker.trackLink(link, 'link');
        Ti.Platform.openURL(link);
    } catch (e) {
        
        console.warn('Failed to open url: ' + url + ': ' + e.message, 'OpenLinkCommand::execute');
    }
}