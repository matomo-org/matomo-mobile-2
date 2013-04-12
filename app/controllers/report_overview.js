// !!$model.get('constantRowsCount') || 
if ('get' == $model.get('action')) {
    exports = Alloy.createController('report_overview_without_dimension', arguments[0]);
} else {
    exports = Alloy.createController('report_overview_with_dimension', arguments[0]);
}