/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik       = require('library/Piwik');
/** @private */
var stringUtils = Piwik.require('Utils/String');
 
/** 
 * @class    Creates and returns an instance of a Titanium TableViewRow. It does automatically set theme related 
 *           settings and handles os specific differences. Extends the default row to set a value and description. 
 *           Always use this function if you need a table row. This ensures the same look and feel in each table view 
 *           without the need of handling os differences.
 *
 * @param    {Object}  [params]                    See <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.TableViewRow-object.html">Titanium API</a> for a list of all available parameters.
 * @param    {string}  [params.value]              Optional. Displays a value within the row.
 * @param    {string}  [params.description]        Optional. Displays a description within the row.
 * @param    {Object}  [params.command]            Optional. An instance of a command. Will be executed as soon as the 
 *                                                 user clicks the row.
 * @param    {string}  [params.layout]             Optional. 'vertical' if a vertical layout shall be used. Use it only
 *                                                 if you don't set a value.
 * @param    {string}  [params.wrapTitle]          If true, the title will not be ellipsized if the title is too long.
 *                                                 The title will be wrapped over multiple lines.
 * @param    {Object}  [params.rightImage]         Optional. An image to render in the right image area of the row cell.
 * @param    {string}  [params.rightImage.url]     The url (local or remote) to the right image.
 * @param    {number}  [params.rightImage.width]   The width of the right image.
 * @param    {number}  [params.rightImage.height]  The height of the right image.
 *
 * @example
 * var row = Piwik.getUI().createTableViewRow({title: 'Language',
 *                                             hasCheck: true,
 *                                             value: 'English'}); // creates an instance of the row
 * row.changeValue('German');                                      // changes the value of the row afterwards
 *
 * @exports  TableViewRow as Piwik.UI.TableViewRow
 */
function TableViewRow () {
}

/**
 * Create and render the TableViewRow depending on the defined parameters.
 * 
 * @param    {Object}  See {@link Piwik.UI.TableViewRow}
 * 
 * @returns  {Titanium.UI.TableViewRow}  A table view row instance extended by the methods 'changeTitle' and 
 *                                       'changeValue'. ChangeValue lets you change the value whereas changeTitle lets
 *                                       you change the title. Please, do not set row.title directly as we use a 
 *                                       custom title label to display the title.
 * 
 */
TableViewRow.prototype.init = function (params) {
    
    if (!params) {
        params = {};
    }

    var title       = params.title || null;
    var value       = params.value || null;
    var description = params.description || null;
    var rightImage  = params.rightImage || null;
    var command     = params.command || null;
    var wrapTitle   = params.wrapTitle || false;

    var hasChild = false;
    if (Piwik.getPlatform().isAndroid && params.hasChild) {
        hasChild = true;
        // do not render native hasChild indicator, we render our own indicator
        delete params.hasChild;
    }
    
    var hasCheck = null;
    if (Piwik.getPlatform().isAndroid && (false === params.hasCheck || true === params.hasCheck)) {
        hasCheck = params.hasCheck;
        // do not render native hasChild indicator, we render our own indicator
        delete params.hasCheck;
    }

    // we handle those parameters ourselves... therefore we delete them and don't pass them to TableViewRow creation
    delete params.title;
    delete params.value;
    delete params.description;
    delete params.rightImage;
    delete wrapTitle;
    params.window = null;

    var row = Ti.UI.createTableViewRow(params);

    if (title) {
        var titleOptions = {text: title, id: 'tableViewRowTitleLabel' + (description ? 'WithDescription' : '')};
        
        if (wrapTitle) {
            titleOptions.ellipsize = false;
            titleOptions.wordWrap  = true;
        }
        
        row.titleLabel = Ti.UI.createLabel(titleOptions);
        
        row.add(row.titleLabel);
    }   
     
    if (command) {
        row.command = command;
        row.addEventListener('click', function () {
            if (this.command) {
                this.command.execute({source: this.titleLabel ? this.titleLabel : null});
            }
        });
    }
    
    if (description) {
        var descriptionLabel = Ti.UI.createLabel({text: description,
                                                  id: 'tableViewRowDescriptionLabel' + (params.layout ? params.layout : '')});
        
        row.add(descriptionLabel);
        descriptionLabel = null;
    }

    if (hasChild) {
        row.add(Ti.UI.createImageView({className: 'tableViewRowArrowDownImage'}));
    }
    
    if (null !== hasCheck) {
        row.checkedOn  = Ti.UI.createImageView({className: 'tableViewRowCheckOn'});
        row.checkedOff = Ti.UI.createImageView({className: 'tableViewRowCheckOff'});
        row.add(row.checkedOn);
        row.add(row.checkedOff);
        
        row.getHasCheck = function () {
            return !!this.myHasChecked;
        };
        
        row.setHasCheck = function (checked){
            this.myHasChecked = !!checked;
            
            if (this.myHasChecked) {
                row.checkedOn.setVisible(true);
                row.checkedOff.setVisible(false);
            } else {
                row.checkedOff.setVisible(true);
                row.checkedOn.setVisible(false);
            }
        }
        
        row.setHasCheck(hasCheck);
    }
    
    /** 
     * @memberOf  Piwik.UI.TableViewRow
     * @function 
     */
    var changeValue = function (value) {

        if (!this.valueLabel && (value || '' === value || 0 === value)) {

            this.valueLabel = Ti.UI.createLabel({text: value, id: 'tableViewRowValueLabel'});

            this.add(this.valueLabel);

        } else if (this.valueLabel && (value || '' === value || 0 === value)) {

            this.valueLabel.text = value;

        } else if (this.valueLabel && !value) {

            this.remove(this.valueLabel);
            this.valueLabel = null;
        }
    };
    
    /** 
     * @memberOf  Piwik.UI.TableViewRow
     * @function 
     */
    var changeTitle = function (title) {
        
        if (!title || !this.titleLabel) {
            
            return;
        }
        
        this.titleLabel.text = title;
    };

    row.changeValue = changeValue;
    row.changeTitle = changeTitle;
    
    row.cleanup = function () {
        
        if (this.checkedOn) {
            this.remove(this.checkedOn);
            this.checkedOn = null;
        }
        if (this.checkedOff) {
            this.remove(this.checkedOff);
            this.checkedOff = null;
        }
        
        this.titleLabel       = null;
        this.valueLabel       = null;
        this.onShowOptionMenu = null;
        this.command          = null;
        
        if (row) {
            row.changeValue       = null;
            row.changeTitle       = null;
            row                   = null;
        }
    };
    
    row.changeValue(value);

    if (params.onShowOptionMenu && Piwik.getPlatform().isAndroid) {
        row.onShowOptionMenu = params.onShowOptionMenu;
        row.addEventListener('longclick', function (event) {
            
            if (this.onShowOptionMenu) {
                this.onShowOptionMenu.apply(this, [event]);
            }
        });
    } 

    if (rightImage && rightImage.url) {

        var rowRightImage = Piwik.getUI().createImageView({width:  stringUtils.toSizeUnit('' + rightImage.width),
                                                           height: stringUtils.toSizeUnit('' + rightImage.height),
                                                           image:  rightImage.url,
                                                           canScale: !Piwik.getPlatform().isAndroid,
                                                           hires:  !Piwik.getPlatform().isAndroid,
                                                           enableZoomControls: false,
                                                           id:     'tableViewRowRightImage'});
        row.add(rowRightImage);
        rowRightImage     = null;
    }
    
    params  = null;
    command = null;

    return row;
};

module.exports = TableViewRow;