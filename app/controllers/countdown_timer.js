var intervalInSeconds = 60;
var interval = null;
var currentInterval = 0;


function setTitle(title)
{
    $.title.text = title + '';
}

function getTitle(title)
{
    return $.title.text;
}

function decrementCounter()
{
    if (!currentInterval) {
        
        return;
    }
    
    if (0 == currentInterval || '-' == getTitle()) {
        // a refresh should occur
        return;
    }
    
    currentInterval = currentInterval - 1;
    setTitle(currentInterval);
}

exports.init = function (seconds) 
{
    intervalInSeconds = seconds;
}

exports.stop = function ()
{
    setTitle('-');
    clearInterval(interval);
    interval = null;
}

exports.start = function ()
{
    if (!interval) {
        interval = setInterval(decrementCounter, 1000);
    }

    currentInterval = intervalInSeconds;
    setTitle(intervalInSeconds);
}