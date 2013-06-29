/**
 * Piwik - Open source web analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

module.exports = {
    getValidAccount: function () {
        return require('alloy').createModel('appAccounts', {
            accessUrl: 'http://demo.piwik.org/index.php',
            tokenAuth: 'anonymous'
        });
    }
};