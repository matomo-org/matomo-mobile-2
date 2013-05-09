Alloy.isTablet = require('Piwik/Platform').isTablet;
Alloy.isHandheld = !Alloy.isTablet;

Alloy.toggleReportConfiguratorVisibility = function(event)
{
    require('report/configurator').toggleVisibility();
}
