exports.execute = function ()
{
    var appRating = new (require('Piwik/App/Rating'));
    appRating.rate();
}