var imageGraphUrl;
var imageGraphEvolutionUrl;
var reportName = '';
var reportDate = '';

function width (image) 
{
    if (image.size && image.size.width) {
        return image.size.width;
    } else if (image.width) {
        return image.width;
    } else {
        console.error('TODO NOT ABLE TO GET IMAGE WIDTH');
    }

    return 0;
}

function height (image) 
{
    if (image.size && image.size.height) {
        return image.size.height;
    } else if (image.height) {
        return image.height;
    } else {
        console.error('TODO NOT ABLE TO GET IMAGE WIDTH');
    }

    return 0;
}

function showDetail ()
{
    var options ={imageGraphUrl: imageGraphUrl,
                  imageGraphEvolutionUrl: imageGraphEvolutionUrl,
                  reportName: reportName, 
                  reportDate: reportDate};

    var detailGraph = Alloy.createController('graphdetail', options);
    detailGraph.open();
}

exports.update = function (processedReportModel, accountModel) {
    imageGraphUrl = processedReportModel.getImageGraphUrl();
    reportName    = processedReportModel.getReportName();
    reportDate    = processedReportModel.getReportDate();
    imageGraphEvolutionUrl = processedReportModel.imageGraphEvolutionUrl();

    if (imageGraphUrl) {
        var graph     = require('Piwik/PiwikGraph');
        imageGraphUrl = graph.addSortOrder(imageGraphUrl, processedReportModel.getSortOrder());
        imageGraphUrl = graph.generateUrl(imageGraphUrl, accountModel);
    }

    if (imageGraphEvolutionUrl) {
        var graph     = require('Piwik/PiwikGraph');
        imageGraphEvolutionUrl = graph.addSortOrder(imageGraphEvolutionUrl, processedReportModel.getSortOrder());
        imageGraphEvolutionUrl = graph.generateUrl(imageGraphEvolutionUrl, accountModel);
    }
    
    // TODO SWITCHGRAPH

    var imageWithSize = graph.appendSize(imageGraphUrl, width($.image), height($.image), OS_IOS);

    console.log(imageWithSize);

    $.image.image = imageWithSize;
}