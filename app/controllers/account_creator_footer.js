/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function L(key)
{
    return require('L')(key);
}

var args = arguments[0] || {};
var accounts = args.accounts;

function tryIt ()
{
    require('Piwik/Tracker').trackEvent({title: 'Try it', url: '/first-login/try-it'});

    require('login').login(
        accounts,
        'http://demo.piwik.org',
        '',
        ''
    );
}

function openFaq ()
{
    require('Piwik/Tracker').trackEvent({title: 'Open FAQ', url: '/first-login/open-faq'});

    require('commands/openFaq').execute();
}
