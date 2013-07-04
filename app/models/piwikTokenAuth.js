/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
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
            "method": "UsersManager.getTokenAuth",
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

            fetchToken: function (accountModel, username, password, onSuccess, onError) {

                if (!username && !password) {
                    this.set({value: this.getAnonymousLoginToken()});

                    onSuccess(this);

                } else {

                    if (!accountModel) {
                        console.info('Cannot fetch token, no account', 'piwikTokenAuth');
                        return;
                    }

                    var passwordHash = this.getPasswordHash(password);
                    
                    this.fetch({
                        account: accountModel,
                        params: {userLogin: username, md5Password: passwordHash},
                        success: onSuccess, 
                        error: onError
                    });
                }
            },

            validResponse: function (response) {

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

