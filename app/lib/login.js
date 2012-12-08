var Alloy = require('Alloy');

exports.login = function(accounts, url, username, password)
{
    var account = Alloy.createModel('AppAccounts', {
        accessUrl: url,
        username: username,
        password: password,
        name: url
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
    });

    account.on('change:tokenAuth', function (accountModel, tokenAuth) {
        console.log('change:tokenAuth');
        var site = Alloy.createModel('piwikEntrySite');

        site.fetch({
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