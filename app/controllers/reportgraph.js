
exports.update = function (report, account) {
    $.image.image = account.getBasePath() + report.get('metadata').imageGraphUrl;
}