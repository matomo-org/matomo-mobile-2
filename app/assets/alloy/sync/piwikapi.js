
function InitAdapter(config) {
    
}

function Sync(method, model, opts) {
   // var name = model.config.adapter.collection_name;
    var settings = model.config.settings;
    var params = model.config.defaultParams;

    Ti.API.info("method " + method);
    
    switch (method) {
        case "read":
        
            // TODO CACHE IF ENABLED
                    
            var _ = require("alloy/underscore");

            var opts = _.extend({}, opts);

            if (opts.params) {
                params = _.extend(_.clone(params), opts.params);
            }

            var PiwikApiRequest = require('Piwik/Network/PiwikApiRequest');
            var request  = new PiwikApiRequest();
            request.setMethod(settings.method);
            request.setParameter(params);
            
            if (opts && opts.account) {
                request.setBaseUrl(opts.account.get('accessUrl'));
                request.setUserAuthToken(opts.account.get('tokenAuth'));
            }
            
            request.setCallback(function (response) {

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

module.exports.sync = Sync;

module.exports.beforeModelCreate = function (config, name)
{
    config = config || {};

    config.data = {}; // for localStorage or case where entire collection is needed to maintain store

    InitAdapter(config);

    return config;
};

module.exports.afterModelCreate = function (Model, name)
{
    Model = Model || {};

    Model.prototype.config.Model = Model; // needed for fetch operations to initialize the collection from persistent store

    return Model;
};