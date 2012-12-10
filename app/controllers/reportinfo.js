
exports.update = function (report) {
    $.name.text = report.get('metadata').dimension + ' - ' + report.get('metadata').name;
    $.date.text = report.get('prettyDate');
}