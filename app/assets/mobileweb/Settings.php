<?php
/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 * @category Piwik_Plugins
 * @package Piwik_LiveTab
 */

namespace Piwik\Plugins\PiwikMobile;

use Piwik\Piwik;
use Piwik\Settings\UserSetting;

/**
 * Settings
 *
 * @package Login
 */
class Settings extends \Piwik\Plugin\Settings
{
    /**
     * @var UserSetting
     */
    public $metric;

    /**
     * @var UserSetting
     */
    public $redirectIfSmartphone;

    /**
     * @var UserSetting
     */
    public $redirectIfTablet;

    protected function init()
    {
        $this->setIntroduction(Piwik::translate('PiwikMobile_SettingsIntroduction'));

        $this->createAutoRedirectSmartphoneSetting();
        $this->createAutoRedirectTabletSetting();
    }

    private function createAutoRedirectSmartphoneSetting()
    {
        $title = Piwik::translate('PiwikMobile_RedirectIfTabletTitle');

        $this->redirectIfTablet = new UserSetting('redirectIfTablet', $title);
        $this->redirectIfTablet->description   = Piwik::translate('PiwikMobile_RedirectIfTabletDescription');
        $this->redirectIfTablet->defaultValue  = false;
        $this->redirectIfTablet->type          = static::TYPE_BOOL;
        $this->redirectIfTablet->uiControlType = static::CONTROL_CHECKBOX;

        $this->addSetting($this->redirectIfTablet);
    }

    private function createAutoRedirectTabletSetting()
    {
        $title = Piwik::translate('PiwikMobile_RedirectIfSmartphoneTitle');

        $this->redirectIfSmartphone = new UserSetting('redirectIfSmartphone', $title);
        $this->redirectIfSmartphone->description     = Piwik::translate('PiwikMobile_RedirectIfSmartphoneDescription');
        $this->redirectIfSmartphone->defaultValue    = false;
        $this->redirectIfSmartphone->type            = static::TYPE_BOOL;
        $this->redirectIfSmartphone->uiControlType   = static::CONTROL_CHECKBOX;

        $this->addSetting($this->redirectIfSmartphone);
    }

}
