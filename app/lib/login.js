var L     = require('L');
var Alloy = require('alloy');

var accessUrl = '';

var win = null;

function showWaitingIndicator()
{
    if (win) {
        return win;
    }

    var style = '';
    if (OS_IOS){
      style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
    } else {
      style = Ti.UI.ActivityIndicatorStyle.DARK;
    }

    var activityIndicator = Ti.UI.createActivityIndicator({
      font: {fontSize:26, fontWeight:'bold'},
      message: L('Mobile_VerifyAccount'),
      style: style
    });

    win = Ti.UI.createWindow({backgroundColor: 'white', zIndex: 99999});
    win.add(activityIndicator);
    win.open();

    activityIndicator.show();
    activityIndicator = null;
}

function hideWaitingIndicator()
{
    if (win) {
        win.close();
        win = null;
    }
}

function onError (accountModel, error) {
    hideWaitingIndicator();

    var message = '';
    switch (error) {
        case 'MissingUsername':
            message = String.format(L('General_Required'), L('Login_Login'));
            break;
        case 'MissingPassword':
            message = String.format(L('General_Required'), L('Login_Password'));
            break;
        case 'InvalidUrl':
            message = String.format(L('SitesManager_ExceptionInvalidUrl'), accessUrl + '');
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

    showWaitingIndicator();

    account.on('sync', function (accountModel) {
        console.log('account synced');
        accountModel.updatePiwikVersion();
    });

    var verifyAuthToken = function (accountModel)
    {
        console.log('verifyAuthToken');
        var site = Alloy.createCollection('piwikAccessVerification');
        // verify if user has access to at least one website using the given authToken

        site.fetch({
            account: accountModel,
            success: function () {
                // it has access to at least one webistes

                console.log('Account has access to websites');

                hideWaitingIndicator();

                accountModel.save();
                accountModel.trigger('sync', accountModel);
                accounts.add(accountModel);

            }, error: function () {

                console.log('Acconut has no access to websites');

                accountModel.clear({silent: true});
                return accountModel.trigger('error', accountModel, 'NoViewAccess');
            }
        });
    };

    account.on('change:tokenAuth', verifyAuthToken);

    account.updateAuthToken();
}
