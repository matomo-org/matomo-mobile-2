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
    alert('open detail');
}

exports.update = function (processedReportModel, accountModel) {
    var imageGraphUrl = processedReportModel.getImageGraphUrl();

    if (!imageGraphUrl) {
        return;
    }
    
    var graph     = require('Piwik/PiwikGraph');
    imageGraphUrl = graph.addSortOrder(imageGraphUrl, processedReportModel.getSortOrder());
    imageGraphUrl = graph.generateUrl(imageGraphUrl, accountModel);

    var imageWithSize = graph.appendSize(imageGraphUrl, width(this.image), height(this.image), OS_IOS);

    console.log(imageWithSize);

    $.image.image = imageWithSize;
}