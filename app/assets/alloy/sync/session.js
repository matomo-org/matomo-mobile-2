/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */


function InitAdapter(config) {
    
}

function Sync(method, model, opts) {

    switch (method) {
        case "read":
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