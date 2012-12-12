exports.update = function (processedReportModel, accountModel) {
    var imageGraphUrl = processedReportModel.getImageGraphUrl();

    if (!imageGraphUrl) {
        return;
    }
    
    var graph     = require('Piwik/PiwikGraph');
    imageGraphUrl = graph.addSortOrder(imageGraphUrl, processedReportModel.getSortOrder());
    imageGraphUrl = graph.generateUrl(imageGraphUrl, accountModel);

    var imageWithSize = graph.appendSize(imageGraphUrl, this.image.width, this.image.height, OS_IOS);

    console.log(imageWithSize);

    $.image.image = imageWithSize;
}