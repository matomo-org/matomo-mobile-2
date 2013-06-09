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
        case 'AlreadyHandled':
            return;
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
        if (!accountModel) {
            console.info('Cannot update piwik version, no account given', 'login');
            return;
        }

        accountModel.updatePiwikVersion();
    });

    var makeSureUserHasAccessToAtLeastOneWebsite = function (accountModel)
    {
        if (!accountModel) {
            console.info('Cannot verify auth token, no account given', 'login');
            return;
        }

        var site = Alloy.createCollection('piwikAccessVerification');

        site.fetch({
            account: accountModel,
            success: function () {
                // it has access to at least one webistes

                hideWaitingIndicator();

                accountModel.save();
                accountModel.trigger('sync', accountModel);
                accounts.add(accountModel);

                require('Piwik/Tracker').trackEvent({title: 'Account Login Success', url: '/account/login/success'});

            }, error: function (model, event) {

                accountModel.clear({silent: true});

                if (!event || !event.errorMessageDisplayed) {
                    accountModel.trigger('error', accountModel, 'NoViewAccess');
                } else {
                    accountModel.trigger('error', accountModel, 'AlreadyHandled');
                }
            }
        });
    };

    account.on('change:tokenAuth', makeSureUserHasAccessToAtLeastOneWebsite);

    account.updateAuthToken();
};
