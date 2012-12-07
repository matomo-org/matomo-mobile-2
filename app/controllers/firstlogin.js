require("Piwik");

var args = arguments[0] || {};
var accounts = args.accounts || false;

function onUrlReturn () {
    if ($.url.value && -1 === $.url.value.indexOf('http')) {
        // user has not specified any http protocol. automatically prepend 'http'.
        $.url.value = 'http://' + $.url.value;
    }
    
    $.username.focus();
}

function onUsernameReturn () {
    $.password.focus();
}

function onTryIt () {
    $.url.value = 'http://demo.piwik.org';
    $.username.value = '';
    $.password.value = '';
    login();
}

function login () 
{
    var account = Alloy.createModel('AppAccounts', {
        accessUrl: $.url.value,
        username: $.username.value,
        password: $.password.value,
        name: $.url.value
    });
    
    account.on('error', function (error) {
        console.log(error);
        switch (error) {
            case 'MissingUsername':
                break;
            case 'MissingPassword':
                break;
            case 'InvalidUrl':
                break;
            case 'ReceiveAuthTokenError':
                break;
            case 'NoViewAccess':
                break;
            case 'ReceiveAuthTokenError':
                break;
            default:
                return;
        }
        // output message
    });
    
    if (!account.isValid()) {
        return;
    }
    
    account.on('sync', function (accountModel) {
        console.log('account synced');
        accountModel.updatePiwikVersion();
        
        var dialog = Ti.UI.createAlertDialog({message: 'sync'});
        dialog.addEventListener('click', function () {
            Alloy.createController('statistics');
        });
        
        dialog.show();
    });
    
    account.on('change:tokenAuth', function (accountModel, tokenAuth) {
        console.log('change:tokenAuth');
        var site = Alloy.createModel('piwikEntrySite');
        
        site.fetch({
            account: accountModel,
            success: function (siteModel) {

                accountModel.save();
                accountModel.trigger('sync', accountModel);
                
            }, error: function (accountModel) {

                accountModel.clear();
                return accountModel.trigger('error', 'NoViewAccess');
            }
        });
        
    });
    
    account.requestAuthToken();
}

exports.open = function () {
    $.firstlogin.open(); 
};