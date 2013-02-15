var L     = require('L');
var Alloy = require('alloy');

var accessUrl = null;

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
            message = String.format(L('SitesManager_ExceptionInvalidUrl'), accessUrl);
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

exports.login = function(accounts, accessUrl, username, password)
{
    var account = Alloy.createModel('AppAccounts');
    account.on('error', onError);
    
    account.set({
        accessUrl: accessUrl,
        username: username,
        password: password,
        name: accessUrl
    });

    if (!account.isValid()) {
        return;
    }

    account.on('sync', function (accountModel) {
        console.log('account synced');
        accountModel.updatePiwikVersion();
    });

    account.on('change:tokenAuth', function (accountModel) {
        console.log('change:tokenAuth');
        var site = Alloy.createCollection('piwikAccessVerification');
        // verify if user has access to at least one website using the given authToken

        site.fetch({
            account: accountModel,
            success: function () {
                // it has access to at least one webistes

                console.log('Account has access to websites');

                accountModel.save();
                accountModel.trigger('sync', accountModel);
                accounts.add(accountModel);

            }, error: function () {

                console.log('Acconut has no access to websites');

                accountModel.clear({silent: true});
                return accountModel.trigger('error', accountModel, 'NoViewAccess');
            }
        });

    });

    account.updateAuthToken();
}
