
var leftButtons = [
    {image:'ic_action_settings.png', width:32},
    {image:'ic_action_accounts.png', width:32}
];
var bar = Ti.UI.createButtonBar({
    labels: leftButtons,
    backgroundColor: "#B2AEA5"
});

bar.addEventListener('click', function () {
    Alloy.createController('accounts');
});

$.win1.leftNavButton = bar;

$.win1.rightNavButton = Ti.UI.createButton({image:'ic_action_website.png', width:32});

$.index.open();
