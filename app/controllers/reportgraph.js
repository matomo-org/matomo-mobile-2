exports.update = function (processedReportModel, accountModel) {
    var imageGraphUrl = processedReportModel.getImageGraphUrl();

    if (!imageGraphUrl) {
        return;
    }
    
    var graph     = require('Piwik/PiwikGraph');
    imageGraphUrl = graph.addSortOrder(imageGraphUrl, processedReportModel.getSortOrder());
    imageGraphUrl = graph.generateUrl(imageGraphUrl, accountModel);

    $.image.image = imageGraphUrl;
}