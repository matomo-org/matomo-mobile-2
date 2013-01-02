var args = arguments[0] || {};

if (OS_IOS && args.style && 'native' == args.style) {

    exports.getSection = function () 
    {
        var params = {headerTitle: String(title)};

        return Ti.UI.createTableViewSection(params);
    }

} else {
    
    exports.getSection = function ()
    {
        var widget = Alloy.createWidget('org.piwik.tableviewsection', 'section', args);
        return widget.getView();
    }
}