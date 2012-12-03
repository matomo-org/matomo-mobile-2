require("Piwik");

var accounts =  Alloy.createCollection('AppAccounts');
accounts.fetch();

if (!accounts.length) {
    $.index.open();
} else if (1 == accounts.length) {
	Alloy.createController('statistics');
} else {
    Alloy.createController('accounts');
}

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

function login () 
{
    var account = Alloy.createModel('AppAccounts', {
        accessUrl: $.url.value,
        username: $.username.value,
        password: $.password.value,
        name: $.url.value
    });
    
    account.on('error', function (error) {
        alert(error);
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
        accountModel.updatePiwikVersion();
        
        var dialog = Ti.UI.createAlertDialog({message: 'sync'});
        dialog.addEventListener('click', function () {
            Alloy.createController('statistics');
        });
        
        dialog.show();
    });
    
    account.on('change:tokenAuth', function (accountModel, tokenAuth) {

        var site = Alloy.createModel('piwikEntrySite');
        
        site.fetch({
            account: accountModel,
            success: function (siteModel) {

                if (!siteModel || !siteModel.id) {
                    accountModel.clear();
                    return accountModel.trigger('error', 'NoViewAccess');
                }
        
                accountModel.save();
                
            }, error: function (accountModel) {
                return accountModel.trigger('error', 'NoViewAccess');
            }
        });
        
    });
    
    account.requestAuthToken();
}

