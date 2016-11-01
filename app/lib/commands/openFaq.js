/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.execute = function () 
{
    var L = require('L');

    var link = '';
    if (OS_IOS) {
        link = 'http://piwik.org/faq/mobile-app/faq_16332/';
    } else {
        link = 'http://piwik.org/faq/mobile-app/';
    }
    
    var webview = {title: L('General_Faq'), url: link};
    var faq     = Alloy.createController('webview', webview);
    faq.open();
};