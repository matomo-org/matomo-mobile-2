var L     = require('L');
var Alloy = require('alloy');

function onError (accountModel, error) {

    var message = '';
    switch (error) {
        case 'MissingUsername':
            message = String.format(L('General_Required'), L('Login_Login'));
            break;
        case 'MissingPassword':
            message = String.format(L('General_Required'), L('Login_Password'));
            break;
        case 'InvalidUrl':
            var url = '' + accountModel.get('url');
            message = String.format(L('SitesManager_ExceptionInvalidUrl'), url);
            break;
        case 'ReceiveAuthTokenError':
            message = L('Mobile_SaveSuccessError');
            break;
        case 'NoViewAccess':
            message = String.format(L('General_ExceptionPrivilegeAtLeastOneWebsite'), L('UsersManager_PrivView'));
            break;
        default:
            message = L('An unknown error has occured:\n' + error);
    }

     var alertDialog = Ti.UI.createAlertDialog({
        title: L('General_Error'),
        message: message,
        buttonNames: [L('General_Ok')]
    });

    alertDialog.show();
}

exports.login = function(accounts, url, username, password)
{
    var account = Alloy.createModel('AppAccounts');
    account.on('error', onError);
    
    account.set({
        accessUrl: url,
        username: username,
        password: password,
        name: url
    });

    if (!account.isValid()) {
        return;
    }

    account.on('sync', function (accountModel) {
        console.log('account synced');
        accountModel.updatePiwikVersion();
    });

    account.on('change:tokenAuth', function (accountModel, tokenAuth) {
        console.log('change:tokenAuth');
        var site = Alloy.createModel('piwikWebsites');

        site.fetch({
            params: {limit: 1},
            account: accountModel,
            success: function (siteModel) {

                accountModel.save();
                accountModel.trigger('sync', accountModel);
                accounts.add(accountModel);

            }, error: function (accountModel) {

                accountModel.clear();
                return accountModel.trigger('error', 'NoViewAccess');
            }
        });

    });

    account.requestAuthToken();
}
