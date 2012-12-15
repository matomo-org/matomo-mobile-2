var args         = arguments[0] || {};
var accountModel = args.account || false;

$.websitesWindow.title = accountModel.getName();

var siteCollection = Alloy.createCollection('piwikWebsites');

siteCollection.fetch({
    account: accountModel,
    success: renderListOfWebsites
});

function renderListOfWebsites(siteCollection)
{
    var rows = [];
    siteCollection.forEach(function (siteModel) {
        rows.push(Ti.UI.createTableViewRow({title: siteModel.getName(), cid: siteModel.cid}));
    });

    $.websitesTable.setData(rows);
    rows = null;
}

function doSelectWebsite (event) 
{
    var cid     = event.rowData.cid;
    var website = siteCollection.getByCid(cid);

    $.trigger('websiteChosen', website);
    close();
}

function close()
{
    $.index.close();
}

exports.open = function () 
{
    $.index.open();
};