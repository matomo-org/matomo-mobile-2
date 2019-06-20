/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
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

    var style = Ti.UI.ActivityIndicatorStyle.DARK;

    var activityIndicator = Ti.UI.createActivityIndicator({
      font: {fontSize: OS_ANDROID ? '18dp' : 26, fontWeight:'bold'},
      message: L('Mobile_VerifyAccount'),
      style: style
    });

    var winParams = {backgroundColor: '#ddd', opacity: 0.8, zIndex: 99999};

    if (OS_ANDROID) {
        win = Ti.UI.createView(winParams);
        win.add(activityIndicator);
        require('layout').open(win);
    } else {
        win = Ti.UI.createWindow(winParams);
        win.add(activityIndicator);
        win.open();
    }

    activityIndicator.show();
    activityIndicator = null;
}

function hideWaitingIndicator()
{
    if (win && OS_ANDROID) {
        require('layout').close(win);
    } else if (win) {
        win.close();
    }

    win = null;
}

function onError (accountModel, error) {
    hideWaitingIndicator();

    var message = '';
    var title   = '';

    switch (error) {
        case 'MissingUsername':
            message = String.format(L('General_Required'), L('General_Username'));
            title   = 'Account Missing Username';
            break;
        case 'MissingPassword':
            message = String.format(L('General_Required'), L('General_Password'));
            title   = 'Account Missing Password';
            break;
        case 'InvalidUrl':
            message = String.format(L('SitesManager_ExceptionInvalidUrl'), accessUrl + '');
            title   = 'Account Invalid Url';
            break;
        case 'ReceiveAuthTokenError':
            message = L('Mobile_SaveSuccessError');
            title   = 'Account Receive Token Error';
            break;
        case 'NoViewAccess':
            message = String.format(L('Mobile_ExceptionNoViewAccess'), L('UsersManager_PrivView'));
            title   = 'Account No View Access';
            break;
        case 'IncompatiblePiwikVersion':
            message = L('Mobile_IncompatiblePiwikVersion');
            title   = 'Matomo Version Incomptaible';
            break;
        default:
            title   = 'Unknown error';
            message = L('An unknown error has occured:\n' + error);
            require('Piwik/Tracker').setCustomVariable(1, 'Login error', '' + error, 'event');
    }

    if (title) {
        require('Piwik/Tracker').trackEvent({name: title, category: 'Login', action: 'result'});
    }

    var alertDialog = Ti.UI.createAlertDialog({
        title: L('General_Error'),
        message: message,
        buttonNames: [L('General_Ok')]
    });

    alertDialog.show();
}

function isSslValidationEnabled()
{
    var settings = Alloy.createCollection('AppSettings').settings();
    return settings.shouldValidateSsl();
}

function disableSslValidation()
{
    var settings = Alloy.createCollection('AppSettings').settings();
    settings.setValidateSsl(false);
    settings.save();
}

function couldBeSslCertificateIssue(errorMessage)
{
    if (!isSslValidationEnabled()) {
        return false;
    }

    var messageLower = errorMessage.toLowerCase();

    return (-1 !== messageLower.indexOf('certificate') || -1 !== messageLower.indexOf('ssl'));
}

function offerPossibilityToDisableSslValidation(account, errorMessage)
{
    var dialog = Ti.UI.createAlertDialog({
        title: L('Mobile_PossibleSslError'),
        message: String.format(L('Mobile_PossibleSslErrorExplanation'), errorMessage),
        cancel: 1,
        buttonNames: [L('Mobile_IgnoreSslError'), L('General_Cancel')]});
    dialog.addEventListener('click', function (event) {
        if (!event || true === event.cancel || event.cancel === event.index) {
            account.clear({silent: true});
            return;
        }

        disableSslValidation();
        account.set('tokenAuth', '', {silent: true});
        showWaitingIndicator();

        require('Piwik/Tracker').trackEvent({name: 'Ignore Ssl Error', category: 'Login'});

        fetchAuthToken(account);
    });
    dialog.show();
    dialog = null;
}

function askForAuthCode(account)
{
	var theTitle = L('Mobile_EnterAuthCode');
	if (account.getAuthCode()) {
		theTitle = L('Mobile_EnterCorrectAuthCode');
	}
	var textfield;
	var dialogParams = {
        title: theTitle,
        message: L('Mobile_EnterAuthCodeExplanation'),
        cancel: 1,
        buttonNames: [L('TwoFactorAuth_Verify'), L('General_Cancel')]
    };
    if (OS_IOS) {
       	dialogParams.style = Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT;
    } else {
		textfield = Ti.UI.createTextField({
			left: '16dp',
			right: '16dp',
		    value : '',
		    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBER_PAD,
		    autoCorrect: false
		});
		dialogParams.androidView = textfield;
    }
    var dialog = Ti.UI.createAlertDialog(dialogParams);
    dialog.addEventListener('click', function (event) {
        if (!event || true === event.cancel || event.cancel === event.index) {
            account.clear({silent: true});
            return;
        }
        
        if (OS_IOS) {
        	    account.setAuthCode(event.text);
        } else if (textfield) {
        	    account.setAuthCode(textfield.value);
        }

        fetchAuthToken(account);
    });
    
    dialog.show();
    dialog = null;
}

function onNetworkError(error, account) {
    hideWaitingIndicator();

    if (!error) {
        return;
    }
    
    if (error && error.getHttpStatusCode() && error.getHttpStatusCode() == 401) {
    		// show auth code
    		askForAuthCode(account);
    		
    } else if (couldBeSslCertificateIssue('' + error.getMessage()) ||
        couldBeSslCertificateIssue('' + error.getPlatformErrorMessage())) {
        require('Piwik/Tracker').trackEvent({name: 'Ssl Error', category: 'Login'});

        offerPossibilityToDisableSslValidation(account, '' + error.getPlatformErrorMessage());

    } else {

        account.clear({silent: true});

        var dialog = Ti.UI.createAlertDialog({
            title: error.getError(),
            message: error.getMessage(),
            buttonNames: [L('General_Ok')]
        });
        dialog.show();
        dialog = null;
    }
}

function fetchAuthToken(account)
{
    var username = account.getUsername();
    var password = account.getPassword();
    var authCode = account.getAuthCode();

    var tokenAuth = Alloy.createModel('piwikTokenAuth');
    tokenAuth.fetchToken(account, username, password, authCode, function (model) {
        if (model && model.getTokenAuth()) {
            account.set({tokenAuth: model.getTokenAuth()});
        }
    }, function (undefined, error) {
        onNetworkError(error, account);
        account = null;
    });
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
   
    var actuallySaveAccount = function (accountModel) {
        require('Piwik/Tracker').trackEvent({name: 'Account Login Success', action: 'result', category: 'Login'});
        
        accountModel.save();
        accountModel.off();
        accounts.add(accountModel);
        accountModel = null;        
    };
    
    var saveAccountIfPiwikVersionIsGood = function (piwikVersionModel, accountModel)
    {
        if (piwikVersionModel.isFullyCompatible()) {
            
           actuallySaveAccount(accountModel);
           
        } else if (piwikVersionModel.isRestrictedCompatible()) {
            var version = piwikVersionModel.getVersion();
   
            var alertDialog = Ti.UI.createAlertDialog({
                title: L('Mobile_RestrictedCompatibility'),
                message: String.format(L('Mobile_RestrictedCompatibilityExplanation'), version + ''),
                buttonNames: [L('General_Ok'), L('General_Cancel')],
                cancel: 1,
                selectedIndex: 1
            });
            
            alertDialog.addEventListener('click', function (clickEvent) {
                if (!clickEvent || clickEvent.cancel === clickEvent.index || true === clickEvent.cancel) {
                        
                    accountModel.clear({silent: true});
                    accountModel = null;
        
                    return;
                }

                actuallySaveAccount(accountModel);
            });
            
            alertDialog.show(); 
            
        } else {

            accountModel.clear({silent: true});
            accountModel.trigger('error', accountModel, 'IncompatiblePiwikVersion');
        }
    };

    var makeSureUserHasGoodPiwikVersion = function (accountModel)
    {
        var version = Alloy.createModel('piwikVersion');
        version.fetch({
            account: accountModel,
            success: function(model) {
                
                hideWaitingIndicator();

                saveAccountIfPiwikVersionIsGood(model, accountModel);
                accountModel = null;
                
            },
            error: function(undefined, error) {

                onNetworkError(error, accountModel);
                accountModel = null;
            }
        });
    };

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

                if (!siteCollection.hasAccessToAtLeastOneWebsite()) {
                    accountModel.trigger('error', accountModel, 'NoViewAccess');

                    return;
                }

                makeSureUserHasGoodPiwikVersion(accountModel);
                accountModel = null;

            }, error: function (undefined, error) {

                onNetworkError(error, accountModel);
                accountModel = null;
            }
        });
    };

    account.on('change:tokenAuth', makeSureUserHasAccessToAtLeastOneWebsite);

    showWaitingIndicator();

    fetchAuthToken(account);
};
