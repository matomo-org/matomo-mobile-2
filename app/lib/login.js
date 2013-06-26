/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

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
      font: {fontSize: OS_ANDROID ? '18dp' : 26, fontWeight:'bold'},
      message: L('Mobile_VerifyAccount'),
      style: style
    });

    win = Ti.UI.createWindow({backgroundColor: '#ddd', opacity: 0.8, zIndex: 99999});
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
    var title   = '';
    var url     = '';

    switch (error) {
        case 'MissingUsername':
            message = String.format(L('General_Required'), L('Login_Login'));
            title   = 'Account Missing Username';
            url     = '/account/login/error/missing-username';
            break;
        case 'MissingPassword':
            message = String.format(L('General_Required'), L('Login_Password'));
            title   = 'Account Missing Password';
            url     = '/account/login/error/missing-password';
            break;
        case 'InvalidUrl':
            message = String.format(L('SitesManager_ExceptionInvalidUrl'), accessUrl + '');
            title   = 'Account Invalid Url';
            url     = '/account/login/error/invalid-url';
            break;
        case 'ReceiveAuthTokenError':
            message = L('Mobile_SaveSuccessError');
            title   = 'Account Receive Token Error';
            url     = '/account/login/error/receive-token-error';
            break;
        case 'NoViewAccess':
            message = String.format(L('General_ExceptionPrivilegeAtLeastOneWebsite'), L('UsersManager_PrivView'));
            title   = 'Account No View Access';
            url     = '/account/login/error/no-view-access';
            break;
        default:
            title   = 'Unknown error';
            url     = '/account/login/error/unknown/' + error;
            message = L('An unknown error has occured:\n' + error);
    }

    if (title && url) {
        require('Piwik/Tracker').trackEvent({title: title, url: url});
    }

    var alertDialog = Ti.UI.createAlertDialog({
        title: L('General_Error'),
        message: message,
        buttonNames: [L('General_Ok')]
    });

    alertDialog.show();
}

function onNetworkError(undefined, error) {
    hideWaitingIndicator();

    if (error) {

        var dialog = Ti.UI.createAlertDialog({title: error.getError(), message: error.getMessage(), buttonNames: [L('General_Ok')]});
        dialog.show();
        dialog = null;
    }
}

function fetchAuthToken(account)
{
    var username = account.getUsername();
    var password = account.getPassword();

    var tokenAuth = Alloy.createModel('piwikTokenAuth');
    tokenAuth.fetchToken(account, username, password, function (model) {
        if (model && model.getTokenAuth()) {
            account.set({tokenAuth: model.getTokenAuth()});
        }
    }, onNetworkError);
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

    var makeSureUserHasAccessToAtLeastOneWebsite = function (accountModel)
    {
        if (!accountModel) {
            console.info('Cannot verify auth token, no account given', 'login');
            return;
        }

        var site = Alloy.createCollection('piwikAccessVerification');

        site.fetch({
            account: accountModel,
            success: function (siteCollection) {
                // it has access to at least one webistes

                hideWaitingIndicator();

                if (!siteCollection.length) {
                    accountModel.trigger('error', accountModel, 'NoViewAccess');

                    return;
                }

                accountModel.save();
                accountModel.off();
                accounts.add(accountModel);
                accountModel = null;

                require('Piwik/Tracker').trackEvent({title: 'Account Login Success', url: '/account/login/success'});

            }, error: function (undefined, error) {

                accountModel.clear({silent: true});
                accountModel = null;

                onNetworkError(undefined, error);
            }
        });
    };

    account.on('change:tokenAuth', makeSureUserHasAccessToAtLeastOneWebsite);

    showWaitingIndicator();

    fetchAuthToken(account);
};
