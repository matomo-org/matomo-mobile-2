/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

var url = require('url');
var appVersion = require('Piwik').getAppVersion();

function appendIndexPhpIfNecessary(accessUrl)
{
    if (!accessUrl) {
        return '';
    }

    accessUrl = appendSlashIfNecessary(accessUrl);
    
    if (!url.endsWithPhp(accessUrl)) {
        accessUrl = accessUrl + 'index.php';
    }

    return accessUrl;
}

function appendSlashIfNecessary(accessUrl)
{
    if (!accessUrl) {
        return '';
    }

    if (!url.endsWithSlash(accessUrl) && !url.endsWithPhp(accessUrl)) {
        accessUrl = accessUrl + '/';
    } 

    return accessUrl;
}

var Alloy = require('alloy');

exports.definition = {

    config: {
        "columns": {
            "accessUrl":"string",
            "username":"string",
            "tokenAuth":"string",
            "authCode":"string",
            "name":"string",
            "active":"boolean",
            "createVersionNumber":"string",
            "changeVersionNumber":"string",
            "version":"string",
            "dateVersionUpdated":"string",
            "defaultReport": "string",
            "defaultReportDate": "string"
        },
        "adapter": {
            "type": "properties",
            "collection_name": "appaccounts"
        },
        lastUsedAccountPropertyKey: "app_account_id_last_used",
        defaults: {
            active: true,
            createVersionNumber: appVersion,
            changeVersionNumber: appVersion,
            defaultReport: Alloy.CFG.account.defaultReport,
            defaultReportDate: Alloy.CFG.account.defaultReportDate
        }
    },      

    extendModel: function(Model) {      
        _.extend(Model.prototype, {
            
            initialize: function () {
                
                if (this.get('tokenAuth') && this.get('password')) {
                    this.resetPassword();
                    this.save();
                }
                
                this.on('change:accessUrl', this.completeAccessUrl);
                this.on('change:tokenAuth', function (accountModel) {
                    accountModel.resetPassword();
                });
            },

            startWithAllWebsitesDashboard: function () {
                var defaultReport = this.get('defaultReport');

                return ('MultiSites' === defaultReport || _.isEmpty(defaultReport));
                // the isEmpty check is a workaround for http://dev.piwik.org/trac/ticket/3781 to make sure the app
                // won't crash or output an error. We get an empty defaultReport when  the user has not saved his
                // settings yet. In this case, Piwik opens the first existing website by default. We're doing the
                // opposite because we do not know the ID of any website. We could go with siteId 1 by default but
                // it is not guaranteed this site exists. Therefore we're loading the MultiSites dashboard by default. 
            },

            getAuthToken: function () {
                return this.get('tokenAuth');
            },

            entrySiteId: function () {
                return this.get('defaultReport');
            },

            syncPreferences: function () {

            },

            getUsername: function () {
                return this.get('username');
            },

            getPassword: function () {
                return this.get('password');
            },

            getAuthCode: function () {
                return this.get('getAuthCode');
            },

            setAuthCode: function (authCode) {
                return this.set('getAuthCode', authCode);
            },

            getName: function () {
                return this.get('name');
            },

            getDefaultReportDate: function () {
                return this.get('defaultReportDate');
            },

            isSameAccount: function (account) {
                return (account && this.get('id') == account.get('id'));
            },
            
            completeAccessUrl: function (accountModel, accessUrl) {
                
                if (!accessUrl || !accountModel) {
                    console.info('Unable to complete access url, missing account or url', 'appaccounts');
                    return;
                }

                accessUrl = appendIndexPhpIfNecessary(accessUrl);
                
                accountModel.set({accessUrl: accessUrl}, {silent: true});
            },
            
            validate: function (attrs) {

                if (!attrs) {
                    return 'Unknown';
                }
                
                if (attrs.username && !attrs.password && !this.get('tokenAuth')) {
                    // if we have the tokenAuth it is ok not to have the password.
                    return 'MissingPassword';

                } else if (!attrs.username && attrs.password && !this.get('tokenAuth')) {
                    // if we have the tokenAuth it is ok not to have the username.
                    return 'MissingUsername';
                }
                
                var accessUrl = attrs.accessUrl;

                if (!accessUrl || !url.startsWithHttp(accessUrl)) {

                    return 'InvalidUrl';
                }
            },

            resetPiwikVersion: function () {
                
                this.set({version: '', dateVersionUpdated: ''});
                
                return this;
            },

            select: function (callback) {

                this.markAccountAsLastUsed();
                this.updatePreferences(callback);
                this.updatePiwikVersion();
            },

            markAccountAsLastUsed: function () {
                var lastUsedAccountKey = this.config.lastUsedAccountPropertyKey;
                var accountId = '' + this.id;

                if (accountId) {
                    Ti.App.Properties.setString(lastUsedAccountKey, accountId);
                }
            },
            
            resetPassword: function () {
                this.set({password: '*'});
                this.unset('password');
            },

            updatePreferences: function (callback) {

                if ('anonymous' == this.get('tokenAuth')) {
                    callback(this);
                    callback = null;

                    return;
                }

                var preferences = Alloy.createCollection('piwikAccountPreferences');

                var onSuccess = function (account, defaultReport, defaultReportDate) {

                    account.set('defaultReport', defaultReport);
                    account.set('defaultReportDate', defaultReportDate);

                    callback(account);
                    callback = null;
                };

                var onError = function (account) {
                    callback(account);
                    callback = null;
                };

                preferences.fetchPreferences(this, onSuccess, onError);
            },

            updatePiwikVersion: function() {

                var that    = this;
                var account = this;

                var version = Alloy.createModel('piwikVersion');
                version.fetch({
                    account: this,
                    success : function(model) {

                        that.set({dateVersionUpdated: (new Date()) + ''});

                        if (model && model.getVersion()) {
                            that.set({version: '' + model.getVersion()});
                        } else if (!account.get('version')) {
                            that.set({version: ''});
                        } else {
                            // there went something wrong with the request. For example the network connection broke up.
                            // do not set account version to 0 in such a case. We would overwrite an existing version, eg 183
                        }
                        
                        that.save();
                        that    = null;
                        account = null;
                    },
                    error : function(model, resp) {
                        // just ignore, piwik installation is too old
                    }
                });
            },
            
            getBasePath: function () {
                var accessUrl = this.get('accessUrl');
            
                if (!accessUrl) {
            
                    return '';
                }
                
                accessUrl = accessUrl + '';

                if (url.endsWithPhp(accessUrl)) {
                    return url.getAbsolutePath(accessUrl);
                }
            
                accessUrl = appendSlashIfNecessary(accessUrl);
            
                return accessUrl;
            },

            updateAuthToken: function () {
                var username = this.get('username');
                var password = this.get('password');
                var authCode = this.get('authCode');
                var account  = this;

                var onSuccess = function (model) {
                    if (model && model.getTokenAuth()) {
                        account.resetPassword();
                        account.set({tokenAuth: model.getTokenAuth()});
                    }
                };

                var onError = function (model) {
                    account.resetPassword();
                    return account.trigger('error', account, 'ReceiveAuthTokenError');
                };

                var tokenAuth = Alloy.createModel('piwikTokenAuth');
                tokenAuth.fetchToken(this, username, password, authCode, onSuccess, onError);
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {

            hasAccount: function () {
                return !!this.length;
            },

            lastUsedAccount: function () {
                var lastUsedAccountKey = this.config.lastUsedAccountPropertyKey;
                var hasAccountProperty = Ti.App.Properties.hasProperty(lastUsedAccountKey);

                if (!hasAccountProperty) {

                    return this.first();
                }

                var lastUsedAccountId = Ti.App.Properties.getString(lastUsedAccountKey);
                var lastUsedAccount   = this.get(lastUsedAccountId);

                if (!lastUsedAccount) {

                    return this.first();
                }

                return lastUsedAccount;

            }

            
        }); // end extend
        
        return Collection;
    }
        
};

