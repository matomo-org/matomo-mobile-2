function L(key)
{
    return require('L')(key);
}

var args     = arguments[0] || {};
var accounts = Alloy.Collections.appAccounts;

var loginform = Alloy.createController('login_form', {accounts: accounts});

$.loginform.add(loginform.getView());

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

function onOpen()
{
    require('Piwik/Tracker').trackWindow('First Login', 'first-login');
}

exports.close = function ()
{
    require('layout').close($.index);
    $.destroy();
};

exports.open = function ()
{
    require('layout').open($.index);
};