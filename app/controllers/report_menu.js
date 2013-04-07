function updateWebsite(params)
{
    if (params.website) {

    } else {
        
    }
}

function updateDate(params)
{
    if (params.date) {

    } else {
        
    }
}

function updateMetric(params)
{
    if (params.metric) {

    } else {
        
    }
}

function update(params)
{
    updateWebsite(params);
    updateDate(params);
    updateMetric(params);
}

function doChooseWebsite()
{

}

function doChooseDate()
{

}

function doChooseMetric()
{

}

function onClose ()
{
    $.destroy();
}

function open()
{
    $.index.open();
}

function close()
{
    $.index.open();
}

exports.close = close;
exports.open = open;