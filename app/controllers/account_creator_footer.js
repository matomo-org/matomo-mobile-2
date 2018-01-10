/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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
    require('Piwik/Tracker').trackEvent({name: 'Try it', category: 'Account'});

    require('login').login(
        accounts,
        'https://demo.matomo.org',
        '',
        ''
    );
}

function openFaq ()
{
    require('Piwik/Tracker').trackEvent({name: 'Open FAQ', category: 'Account'});

    require('commands/openFaq').execute();
}
