/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/** @private */
var Piwik = require('library/Piwik');

/** 
 * @class    Creates and returns an instance of a Titanium TableViewSection. It does automatically set theme related 
 *           settings and handles os specific differences. Extends the default row/section to set a value. Always use 
 *           this function if you need a table view section. This ensures the same look and feel in each table view 
 *           without the need of handling os differences.
 *
 * @param    {Object}  [params]        See <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.TableViewSection-object.html">Titanium API</a> for a list of all available parameters.
 * @param    {string}  [params.title]  Optional. The title of the section.
 * @param    {string}  [params.style]  Optional. Only for iOS. If 'native', it uses the native headerTitle
 *                                     property to create a TableViewSection (see <a href="http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.UI.TableViewSection-object.html">Titanium API</a>)
 *                                     instead of a headerView. This allows an even more native look. Typically used in
 *                                     settings
 *
 * @example
 * var section = Piwik.getUI().createTableViewSection({title: 'Manage Accounts'}); // creates an instance of the row
 * 
 * @exports  TableViewSection as Piwik.UI.TableViewSection
 */
function TableViewSection () {
}

/**
 * Create and render the TableViewSection depending on the defined parameters.
 *
 * @param    {Object}  See {@link Piwik.UI.TableViewSection}
 *
 * @returns  {Titanium.UI.TableViewRow|Titanium.UI.TableViewSection}  A table view row on Android which looks like a
 *                                                                    section. The native Android TableViewSection is
 *                                                                    not really styleable. A native table view section
 *                                                                    on iOS.
 */
TableViewSection.prototype.init = function (params) {

    if (!params) {
        params = {};
    }

    var title  = params.title || null;
    delete params.title;
    params.window = null;

    var headerLabel = Ti.UI.createLabel({
        text: String(title),
        id: 'tableViewSectionHeaderLabel'
    });

    params.className = 'tableViewSection';

    
    if (Piwik.getPlatform().isIos) {
        // @todo define this in jss
        params.selectionStyle  = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;

        if (params.style && 'native' == params.style) {

            params.headerTitle = String(title);

        } else {

            var headerView           = Ti.UI.createView({className: 'tableViewSection'});
            
            // it is currently not possible to set shadowOffset via jss
            headerLabel.shadowColor  = '#333333';
            headerLabel.shadowOffset = {x: 1, y: 1};
            
            headerView.add(headerLabel);
            
            headerLabel              = null;
            params.headerView        = headerView;
            headerView               = null;
        }

        return Ti.UI.createTableViewSection(params);
    }

    // use a row instead of a section cause the row is better to style on Android.
    var section = Ti.UI.createTableViewRow(params);

    section.add(headerLabel);
    headerLabel = null;

    return section;
};

module.exports = TableViewSection;