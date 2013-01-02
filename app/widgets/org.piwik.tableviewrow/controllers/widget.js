var args = arguments[0] || {};

if (args.title && args.description) {

    exports.getRow = function ()
    {
        var widget = Alloy.createWidget('org.piwik.tableviewrow', 'title_description', args);
        return widget.getView();
    }

} else if (args.title && args.value) {

    exports.getRow = function ()
    {
        var widget = Alloy.createWidget('org.piwik.tableviewrow', 'title_value', args);
        return widget.getView();
    }

}