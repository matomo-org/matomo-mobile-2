exports.execute = function () 
{
    var L = require('L');
    
    var webview = {title: L('General_Faq'), url: 'http://piwik.org/mobile/faq/'};
    var faq     = Alloy.createController('webview', webview)
    faq.open();
}