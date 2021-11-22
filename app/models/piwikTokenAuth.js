/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

exports.definition = {
    
    config: {
        "columns": {
            "value":"string"
        },
        "adapter": {
            "type": "piwikapi",
            "collection_name": "piwiktokenauth"
        },
        "cache": false,
        "settings": {
            "displayErrors": true
        },
        "defaultParams": {}
    },        

    extendModel: function(Model) {        
        _.extend(Model.prototype, {


            getPasswordHash: function (password) {
                return Ti.Utils.md5HexDigest(password);
            },

            getTokenAuth: function () {
                return this.get('value');
            },

            getAnonymousLoginToken: function () {
                return 'anonymous';
            },

            fetchToken: function (accountModel, username, password, authCode, onSuccess, onError) {

                if (!username && !password) {
                    this.set({value: this.getAnonymousLoginToken()});

                    onSuccess(this);

                } else {

                    if (!accountModel) {
                        console.info('Cannot fetch token, no account', 'piwikTokenAuth');
                        return;
                    }

                    var passwordHash = this.getPasswordHash(password);

                    var params = {userLogin: username, md5Password: passwordHash, method: 'UsersManager.getTokenAuth'};
                    if (authCode) {
                    	    params.authCode = authCode;
                    }

                    //first test using matomo 3.X
                    var that = this;
                    this.fetch({
                        account: accountModel,
                        params: params,
                        success: onSuccess, 
                        error: function (undefined, error) {
                            if (error && error.getMessage() && error.getMessage().indexOf('getTokenAuth') > 0) {
                                // now test for matomo 4.x
                                var params = {
                                    'userLogin': username,
                                    'passwordConfirmation': password,
                                    'description': 'Matomo Mobile 2',
                                    'method': 'UsersManager.createAppSpecificTokenAuth'
                                };
                                if (authCode) {
                                    params.authCode = authCode;
                                }
                                that.fetch({
                                    account: accountModel,
                                    params: params,
                                    success: onSuccess,
                                    error: onError
                                });
                            } else {
                                onError(undefined, error)
                            }
                        }
                    });
                }
            },

            validResponse: function (response) {
                if (typeof response === 'string' && response) {
                    // matomo4
                    return response;
                }
                return _.isObject(response) && _.has(response, 'value');
            }

        }); // end extend
        
        return Model;
    },
    
    
    extendCollection: function(Collection) {        
        _.extend(Collection.prototype, {
            
            validResponse: function (response) {

                return _.isObject(response) && _.has(response, 'value');
            }
        }); // end extend
        
        return Collection;
    }
        
};

