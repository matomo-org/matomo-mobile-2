function L(key)
{
    return require('L')(key);
}

function onClose()
{
    $.destroy();
}

function platformInfo()
{
    return String.format('%s %s %s (%s)', 
                         '' + Ti.Platform.name, 
                         '' + Ti.Platform.version, 
                         '' + Ti.Platform.model, 
                         '' + Ti.Platform.locale);
}

function versionInfo()
{
    return String.format("%s - %s %s", 
                         '' + Ti.App.version, 
                         '' + Ti.version, 
                         '' + Ti.buildHash);
}

function render()
{
    var rows = [];
    /*
    rows.push(this.create('TableViewRow', {title: 'Email us', 
                                           description: 'Send us fedback, report a bug or a feature wish.', 
                                           command: this.createCommand('SendFeedbackCommand')}));

    var appRating = new (require('Piwik/App/Rating'));
    if (appRating.canRate()) {
        rows.push(this.create('TableViewRow', {title: 'Rate us on the App Store', 
                                               description: 'Piwik Mobile App is a Free Software, we would really appreciate if you took 1 minute to rate us.', 
                                               command: this.createCommand('RateAppCommand')}));
    }

    rows.push(this.create('TableViewRow', {title: 'Learn how you can participate', 
                                           description: 'Piwik is a project made by the community, you can participate in the Piwik Mobile App or Piwik.',
                                           command: this.createCommand('OpenLinkCommand', {link: 'http://piwik.org/contribute/'})}));
                                                     
    rows.push(this.create('TableViewSection', {title: 'About', style: 'native'}));
    rows.push(this.create('TableViewRow', {title: 'Version', description: versionInfo()}));
    rows.push(this.create('TableViewRow', {title: 'Platform', description: platformInfo()}));
*/
    $.feedbackTable.setData(rows);
    rows = null;
}

exports.open = function () {
    render();
    require('layout').open($.index);
}