require("Piwik");

var args = arguments[0] || {};
var accounts = args.accounts || false;

function onUrlReturn () {
	onUrlBlur();
	
	$.username.focus();
}

function onUrlBlur () {
    if ($.url.value && -1 === $.url.value.indexOf('http')) {
        // user has not specified any http protocol. automatically prepend 'http'.
        $.url.value = 'http://' + $.url.value;
    }
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
        console.log(error);
        switch (error) {
            case 'MissingUsername':
            	alert('Missing Username');
                break;
            case 'MissingPassword':
            	allert('Missing Password');
                break;
            case 'InvalidUrl':
                alert('Invalid Url');
                break;
            case 'ReceiveAuthTokenError':
            	alert('Recieve Auth Token Error');
                break;
            case 'NoViewAccess':
            	alert('No View Access');
                break;
            default:
            	allert('An unknown error has occured:\n' + error)
                return;
        }
        // output message
    });
    
    if (!account.isValid()) {
        alert('URL must not be empty!\nfoo\nbar');
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