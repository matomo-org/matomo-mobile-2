/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */


function InitAdapter(config) {
    
}

function Sync(method, model, opts) {
   // var name = model.config.adapter.collection_name;
    var settings = model.config.settings;
    var params   = model.config.defaultParams;

    model.isSyncing = true;

    switch (method) {
        case "read":
        
            // TODO CACHE IF ENABLED
                    
            var _ = require("alloy/underscore");

            opts = _.clone(opts);

            if (opts.params) {
                params = _.extend(_.clone(params), opts.params);
            }

            var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');
            var request = model.xhrRequest = new PiwikApiRequest();
            request.setMethod(settings.method);
            request.setParameter(params);
            
            if (opts && opts.account) {
                request.setBaseUrl(opts.account.get('accessUrl'));
                request.setUserAuthToken(opts.account.get('tokenAuth'));
            }
            
            request.setCallback(function (response) {
                model.isSyncing  = false;
                model.xhrRequest = null;

                if (_.isUndefined(response) || _.isNull(response)) {

                    opts.error && opts.error(model, {errorMessageDisplayed: this.errorMessageSent});

                } else if (_.isFunction(model.validResponse) && !model.validResponse(response)) {

                    opts.error && opts.error(model, {errorMessageDisplayed: this.errorMessageSent});

                } else {
                    opts.success && opts.success(response);
                }

                model = null;
            });
            
            if (false === settings.displayErrors) {
                request.sendErrors = false;
            }
            
            request.send();
            request = null;
            
            break;
            
        case "create":
        case "update":
        case "delete":
            break;
    }
}

function addAbortXhrFeature (Model)
{    
    Model = Model || {};

    Model.prototype.abort = function () 
    {
        console.debug('Model abort requested.');

        if (this.xhrRequest) {
            console.info('XHR found, will try to abort');
            this.xhrRequest.abort();
            this.xhrRequest = null;
            this.isSyncing  = false;
        }
    };

    Model.prototype.abortRunningRequests = function ()
    {
        if (this.isSyncing) {
            this.abort();
        }
    };

    return Model;
}

module.exports.sync = Sync;
module.exports.afterCollectionCreate = addAbortXhrFeature;